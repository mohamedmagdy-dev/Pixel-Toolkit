import { spawn, exec } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const FFMPEG_DIR = 'C:\\Users\\mego-dev\\AppData\\Local\\Programs\\Python\\Python311\\Lib\\site-packages\\static_ffmpeg\\bin\\win32';

function parseRequestBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        console.warn('[API parseRequestBody] JSON parse warning:', err.message, body);
        resolve({});
      }
    });
    req.on('error', (err) => {
      console.warn('[API parseRequestBody] Stream error:', err.message);
      resolve({});
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function toolkitBackendPlugin() {
  return {
    name: 'toolkit-backend-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Handle CORS preflight
        if (req.method === 'OPTIONS') {
          res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
          return res.end();
        }

        // 1. GET /api/status
        if (req.url === '/api/status' && req.method === 'GET') {
          return sendJson(res, 200, {
            status: 'online',
            platform: process.platform,
            ffmpegReady: fs.existsSync(path.join(FFMPEG_DIR, 'ffmpeg.exe'))
          });
        }

        // 2. POST /api/select-folder (Native Windows Folder Picker Dialog)
        if (req.url === '/api/select-folder' && req.method === 'POST') {
          try {
            // Run PowerShell in STA mode so the Windows Dialog shows reliably
            const psScript = `
              [System.Reflection.Assembly]::LoadWithPartialName('System.windows.forms') | Out-Null
              $f = New-Object System.Windows.Forms.FolderBrowserDialog
              $f.Description = 'Select download destination folder for PixelKit'
              $f.ShowNewFolderButton = $true
              $res = $f.ShowDialog([System.Windows.Forms.NativeWindow]::new())
              if ($res -eq [System.Windows.Forms.DialogResult]::OK) {
                  [Console]::Out.Write($f.SelectedPath)
              }
            `.trim();

            const child = spawn('powershell', ['-NoProfile', '-Sta', '-Command', psScript]);
            let output = '';
            let errOutput = '';
            child.stdout.on('data', d => output += d.toString());
            child.stderr.on('data', d => errOutput += d.toString());

            child.on('close', code => {
              const selected = output.trim();
              if (selected) {
                return sendJson(res, 200, { success: true, path: selected.replace(/\\/g, '/') });
              } else {
                return sendJson(res, 200, { success: false, cancelled: true });
              }
            });
            return;
          } catch (err) {
            console.error('[API select-folder error]', err);
            return sendJson(res, 500, { success: false, error: err.message });
          }
        }

        // 3. POST /api/fetch-info (Real yt-dlp metadata)
        if (req.url === '/api/fetch-info' && req.method === 'POST') {
          try {
            const { url } = await parseRequestBody(req);
            if (!url) return sendJson(res, 400, { error: 'URL is required' });

            const args = ['-m', 'yt_dlp', '--no-warnings', '--dump-single-json', '--skip-download', '--no-playlist', url];
            const child = spawn('python', args);

            let stdout = '';
            let stderr = '';
            child.stdout.on('data', d => stdout += d.toString());
            child.stderr.on('data', d => stderr += d.toString());

            child.on('close', code => {
              // Extract the JSON portion safely
              const jsonStart = stdout.indexOf('{');
              const jsonEnd = stdout.lastIndexOf('}');

              if (jsonStart !== -1 && jsonEnd !== -1) {
                try {
                  const jsonStr = stdout.slice(jsonStart, jsonEnd + 1);
                  const info = JSON.parse(jsonStr);
                  const durationSec = Math.round(info.duration || 0);
                  const mins = Math.floor(durationSec / 60);
                  const secs = durationSec % 60;
                  const formattedDuration = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

                  return sendJson(res, 200, {
                    id: info.id,
                    title: info.title,
                    author: info.uploader || info.channel || 'YouTube Creator',
                    duration: formattedDuration,
                    durationSec: durationSec,
                    thumbnail: info.thumbnail,
                    views: info.view_count ? info.view_count.toLocaleString() : 'N/A'
                  });
                } catch (parseErr) {
                  console.error('[API fetch-info parse error]', parseErr);
                  return sendJson(res, 500, { error: 'Failed to parse metadata JSON', details: parseErr.message });
                }
              }

              if (code !== 0) {
                console.error('[API fetch-info failed]', stderr);
                return sendJson(res, 500, { error: 'Failed to retrieve video details', stderr: stderr.slice(-400) });
              }

              return sendJson(res, 500, { error: 'Unexpected output from yt-dlp' });
            });
            return;
          } catch (err) {
            console.error('[API fetch-info uncaught error]', err);
            return sendJson(res, 500, { error: err.message });
          }
        }

        // 4. POST /api/download (Real yt-dlp download & clipping directly to user's folder)
        if (req.url === '/api/download' && req.method === 'POST') {
          try {
            const body = await parseRequestBody(req);
            const {
              url,
              folder,
              mode = 'video',
              quality = '1080p',
              audioFormat = 'mp3',
              enableTrim = false,
              trimStart = 0,
              trimEnd = 60
            } = body;

            if (!url) return sendJson(res, 400, { error: 'URL is required' });

            // Normalize folder path cleanly
            const rawFolder = folder ? folder.trim().replace(/\\/g, '/') : '';
            const destFolder = rawFolder 
              ? path.resolve(rawFolder) 
              : path.join(os.homedir(), 'Downloads', 'PixelKit');

            if (!fs.existsSync(destFolder)) {
              fs.mkdirSync(destFolder, { recursive: true });
            }

            const args = [
              '-m', 'yt_dlp',
              '--no-warnings',
              '--no-playlist',
              '-P', destFolder,
              '--ffmpeg-location', FFMPEG_DIR
            ];

            // Mode & Format configuration (Flexible to work on ANY YouTube video)
            if (mode === 'audio') {
              args.push('-x');
              let fmt = 'mp3';
              if (audioFormat === 'm4a-aac') fmt = 'm4a';
              else if (audioFormat === 'wav') fmt = 'wav';
              else if (audioFormat === 'flac') fmt = 'flac';
              args.push('--audio-format', fmt);

              if (audioFormat.includes('320')) {
                args.push('--audio-quality', '320k');
              } else if (audioFormat.includes('192')) {
                args.push('--audio-quality', '192k');
              }
            } else {
              // Video configuration: flexible fallback so it never fails on WebM/VP9 videos
              const height = parseInt(quality.replace('p', ''), 10) || 1080;
              args.push('-f', `bv*[height<=${height}]+ba/b[height<=${height}]/bv*+ba/b`);
              args.push('--merge-output-format', 'mp4');
            }

            // Trimming / Clipping section
            if (enableTrim && trimEnd > trimStart) {
              const startStr = formatTime(trimStart);
              const endStr = formatTime(trimEnd);
              args.push('--download-sections', `*${startStr}-${endStr}`);
              args.push('--force-keyframes-at-cuts');
              args.push('-o', '%(title)s [Clip ' + startStr.replace(/:/g, '_') + '-' + endStr.replace(/:/g, '_') + '].%(ext)s');
            } else {
              args.push('-o', '%(title)s.%(ext)s');
            }

            args.push(url);

            console.log('[yt-dlp download running in]:', destFolder);

            const child = spawn('python', args);

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', d => {
              stdout += d.toString();
            });

            child.stderr.on('data', d => {
              stderr += d.toString();
            });

            child.on('close', code => {
              if (code !== 0) {
                console.error('[yt-dlp download failed with code ' + code + ']', stderr);
                return sendJson(res, 500, {
                  success: false,
                  error: 'yt-dlp download encountered an issue',
                  details: stderr.slice(-400)
                });
              }

              // Scan destination folder for the newest file created
              try {
                const files = fs.readdirSync(destFolder).map(f => {
                  const fp = path.join(destFolder, f);
                  return { name: f, time: fs.statSync(fp).mtimeMs, size: fs.statSync(fp).size };
                }).sort((a, b) => b.time - a.time);

                const latestFile = files[0];
                const sizeMb = latestFile ? (latestFile.size / (1024 * 1024)).toFixed(1) + ' MB' : 'Done';

                return sendJson(res, 200, {
                  success: true,
                  fileName: latestFile ? latestFile.name : 'Downloaded media',
                  filePath: latestFile ? path.join(destFolder, latestFile.name).replace(/\\/g, '/') : destFolder,
                  folder: destFolder.replace(/\\/g, '/'),
                  size: sizeMb
                });
              } catch (e) {
                return sendJson(res, 200, {
                  success: true,
                  folder: destFolder.replace(/\\/g, '/')
                });
              }
            });
            return;
          } catch (err) {
            console.error('[API download error]', err);
            return sendJson(res, 500, { success: false, error: err.message });
          }
        }

        // 5. POST /api/open-folder (Opens Windows Explorer directly to the folder)
        if (req.url === '/api/open-folder' && req.method === 'POST') {
          try {
            const { folder } = await parseRequestBody(req);
            const target = folder ? path.resolve(folder.trim().replace(/\\/g, '/')) : os.homedir();
            exec(`explorer.exe "${target}"`);
            return sendJson(res, 200, { success: true });
          } catch (err) {
            return sendJson(res, 500, { error: err.message });
          }
        }

        next();
      });
    }
  };
}
