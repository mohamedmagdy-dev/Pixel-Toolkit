import { spawn, exec } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const FFMPEG_DIR = 'C:\\Users\\mego-dev\\AppData\\Local\\Programs\\Python\\Python311\\Lib\\site-packages\\static_ffmpeg\\bin\\win32';

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
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

        // 2. POST /api/select-folder (Native Windows Folder Picker Window)
        if (req.url === '/api/select-folder' && req.method === 'POST') {
          try {
            const psScript = `
              [System.Reflection.Assembly]::LoadWithPartialName('System.windows.forms') | Out-Null
              $f = New-Object System.Windows.Forms.FolderBrowserDialog
              $f.Description = 'Select download destination for PixelKit'
              $f.ShowNewFolderButton = $true
              $res = $f.ShowDialog()
              if ($res -eq [System.Windows.Forms.DialogResult]::OK) {
                  [Console]::Out.Write($f.SelectedPath)
              }
            `.trim();

            const child = spawn('powershell', ['-NoProfile', '-Command', psScript]);
            let output = '';
            child.stdout.on('data', d => output += d.toString());
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
            return sendJson(res, 500, { success: false, error: err.message });
          }
        }

        // 3. POST /api/fetch-info (Real yt-dlp metadata)
        if (req.url === '/api/fetch-info' && req.method === 'POST') {
          try {
            const { url } = await parseRequestBody(req);
            if (!url) return sendJson(res, 400, { error: 'URL is required' });

            const args = ['-m', 'yt_dlp', '--dump-single-json', '--skip-download', '--no-playlist', url];
            const child = spawn('python', args);

            let stdout = '';
            let stderr = '';
            child.stdout.on('data', d => stdout += d.toString());
            child.stderr.on('data', d => stderr += d.toString());

            child.on('close', code => {
              if (code !== 0) {
                return sendJson(res, 500, { error: 'Failed to retrieve video details', stderr });
              }
              try {
                const info = JSON.parse(stdout);
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
              } catch (e) {
                return sendJson(res, 500, { error: 'Failed to parse metadata JSON' });
              }
            });
            return;
          } catch (err) {
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

            // Default folder if not provided
            const destFolder = folder 
              ? path.resolve(folder) 
              : path.join(os.homedir(), 'Downloads', 'PixelKit');

            if (!fs.existsSync(destFolder)) {
              fs.mkdirSync(destFolder, { recursive: true });
            }

            const args = [
              '-m', 'yt_dlp',
              '--no-playlist',
              '-P', destFolder,
              '--ffmpeg-location', FFMPEG_DIR
            ];

            // Mode & Format configuration
            if (mode === 'audio') {
              args.push('-x');
              const fmt = audioFormat.startsWith('mp3') ? 'mp3' : (audioFormat === 'm4a-aac' ? 'm4a' : 'mp3');
              args.push('--audio-format', fmt);
              if (audioFormat.includes('320')) {
                args.push('--audio-quality', '320k');
              } else if (audioFormat.includes('192')) {
                args.push('--audio-quality', '192k');
              }
            } else {
              // Video configuration
              const height = parseInt(quality.replace('p', ''), 10) || 1080;
              args.push('-f', `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${height}][ext=mp4]/best`);
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

            console.log('[yt-dlp download args]', args.join(' '));

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
                console.error('[yt-dlp error]', stderr);
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
                const sizeMb = latestFile ? (latestFile.size / (1024 * 1024)).toFixed(1) + ' MB' : 'Unknown';

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
            return sendJson(res, 500, { success: false, error: err.message });
          }
        }

        // 5. POST /api/open-folder (Opens Windows Explorer directly to the folder)
        if (req.url === '/api/open-folder' && req.method === 'POST') {
          try {
            const { folder } = await parseRequestBody(req);
            const target = folder ? path.resolve(folder) : os.homedir();
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
