<script>
  import { DropZone, Slider, Select, Button } from '$lib/components/ui/index.js';
  import { Film, Image, Download, Trash2, Camera, Play, Pause, Layers } from '@lucide/svelte';
  import { toast } from '$lib/stores/toast.js';

  let videoFile = $state(null);
  let videoUrl = $state('');
  let videoEl = $state(null);
  let canvasEl = $state(null);

  let duration = $state(0);
  let currentTime = $state(0);
  let isPlaying = $state(false);

  // Settings
  let extractMode = $state('interval'); // 'single' | 'interval'
  let intervalSec = $state(1);
  let maxFrames = $state(10);
  let imgFormat = $state('image/png'); // 'image/png' | 'image/jpeg'
  let imgQuality = $state(90);
  let scalePercent = $state(100);

  let isExtracting = $state(false);
  let extractedFrames = $state([]); // [{ id, url, time, size }]

  function handleFiles(files) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file (MP4, WebM, MOV)');
      return;
    }

    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    videoFile = file;
    videoUrl = URL.createObjectURL(file);
    extractedFrames = [];
    toast.success(`Loaded video: ${file.name}`);
  }

  function onVideoLoadedMetadata() {
    if (videoEl) {
      duration = videoEl.duration;
      currentTime = 0;
    }
  }

  function onTimeUpdate() {
    if (videoEl) {
      currentTime = videoEl.currentTime;
    }
  }

  function seekVideo(time) {
    if (videoEl) {
      videoEl.currentTime = time;
      currentTime = time;
    }
  }

  function togglePlay() {
    if (!videoEl) return;
    if (videoEl.paused) {
      videoEl.play();
      isPlaying = true;
    } else {
      videoEl.pause();
      isPlaying = false;
    }
  }

  function captureCurrentFrame() {
    if (!videoEl || !canvasEl) return;

    const width = Math.round((videoEl.videoWidth * scalePercent) / 100);
    const height = Math.round((videoEl.videoHeight * scalePercent) / 100);

    canvasEl.width = width;
    canvasEl.height = height;

    const ctx = canvasEl.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, width, height);

    const quality = imgFormat === 'image/jpeg' ? imgQuality / 100 : undefined;
    const dataUrl = canvasEl.toDataURL(imgFormat, quality);

    extractedFrames.unshift({
      id: Date.now() + Math.random(),
      url: dataUrl,
      time: videoEl.currentTime.toFixed(2),
      width,
      height
    });

    toast.success(`Captured frame at ${videoEl.currentTime.toFixed(2)}s`);
  }

  async function startIntervalExtraction() {
    if (!videoEl || !canvasEl) return;
    if (isExtracting) return;

    isExtracting = true;
    videoEl.pause();
    isPlaying = false;

    const totalSteps = Math.min(maxFrames, Math.floor(duration / intervalSec));
    if (totalSteps <= 0) {
      toast.warning('Interval is larger than video duration');
      isExtracting = false;
      return;
    }

    let count = 0;
    for (let t = 0; t <= duration && count < maxFrames; t += intervalSec) {
      await new Promise(resolve => {
        videoEl.currentTime = t;
        videoEl.onseeked = () => {
          captureCurrentFrame();
          count++;
          resolve();
        };
      });
    }

    isExtracting = false;
    toast.success(`Extracted ${count} frames successfully!`);
  }

  function downloadFrame(frame) {
    const ext = imgFormat === 'image/png' ? 'png' : 'jpg';
    const a = document.createElement('a');
    a.href = frame.url;
    a.download = `frame_${frame.time}s.${ext}`;
    a.click();
  }

  function downloadAllFrames() {
    extractedFrames.forEach((frame, i) => {
      setTimeout(() => downloadFrame(frame), i * 150);
    });
    toast.info(`Downloading ${extractedFrames.length} frames...`);
  }

  function clearFrames() {
    extractedFrames = [];
    toast.info('Cleared extracted frames');
  }

  function formatDuration(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m}:${s.toString().padStart(2, '0')}.${ms}`;
  }
</script>

<canvas bind:this={canvasEl} style="display: none;"></canvas>

<div class="tool-layout">
  <div class="controls-column">
    <!-- File Input -->
    <div class="panel-section">
      <h3 class="section-title">Source Video</h3>
      {#if !videoFile}
        <DropZone
          accept="video/*"
          label="Select or Drop Video"
          hint="Supports MP4, WebM, MOV"
          onfiles={handleFiles}
        />
      {:else}
        <div class="video-info-box">
          <Film size={20} class="text-accent" />
          <div class="info-meta">
            <span class="file-name">{videoFile.name}</span>
            <span class="file-sub mono">{formatDuration(duration)} | {(videoFile.size / (1024 * 1024)).toFixed(1)} MB</span>
          </div>
          <Button variant="ghost" size="sm" onclick={() => { videoFile = null; videoUrl = ''; extractedFrames = []; }}>
            <Trash2 size={13} />
          </Button>
        </div>
      {/if}
    </div>

    <!-- Extraction Mode & Settings -->
    <div class="panel-section">
      <h3 class="section-title">Extraction Mode</h3>
      <div class="mode-buttons">
        <button
          type="button"
          class="mode-btn"
          class:active={extractMode === 'single'}
          onclick={() => extractMode = 'single'}
        >
          Single Frame
        </button>
        <button
          type="button"
          class="mode-btn"
          class:active={extractMode === 'interval'}
          onclick={() => extractMode = 'interval'}
        >
          Interval Batch
        </button>
      </div>

      {#if extractMode === 'interval'}
        <Slider
          label="Extract Every"
          unit="s"
          min={0.2}
          max={10}
          step={0.2}
          bind:value={intervalSec}
        />
        <Slider
          label="Max Frame Limit"
          unit="frames"
          min={2}
          max={60}
          step={1}
          bind:value={maxFrames}
        />
      {/if}
    </div>

    <!-- Output Format Settings -->
    <div class="panel-section">
      <h3 class="section-title">Frame Quality & Format</h3>
      <Select
        label="Format"
        options={[
          { value: 'image/png', label: 'PNG (Lossless)' },
          { value: 'image/jpeg', label: 'JPEG (Compressed)' }
        ]}
        bind:value={imgFormat}
      />
      {#if imgFormat === 'image/jpeg'}
        <Slider
          label="JPEG Quality"
          unit="%"
          min={20}
          max={100}
          bind:value={imgQuality}
        />
      {/if}
      <Slider
        label="Resolution Scale"
        unit="%"
        min={25}
        max={100}
        step={5}
        bind:value={scalePercent}
      />
    </div>

    <!-- Action Buttons -->
    <div class="panel-section">
      {#if extractMode === 'single'}
        <Button
          variant="primary"
          size="md"
          disabled={!videoFile}
          onclick={captureCurrentFrame}
        >
          <Camera size={15} />
          <span>Capture Current Frame</span>
        </Button>
      {:else}
        <Button
          variant="primary"
          size="md"
          disabled={!videoFile || isExtracting}
          onclick={startIntervalExtraction}
        >
          <Layers size={15} />
          <span>{isExtracting ? 'Extracting Frames...' : 'Start Batch Extraction'}</span>
        </Button>
      {/if}
    </div>
  </div>

  <!-- Video Player & Gallery Column -->
  <div class="preview-column">
    <!-- Video Player Box -->
    <div class="player-container">
      {#if videoUrl}
        <div class="video-wrapper">
          <!-- svelte-ignore a11y_media_has_caption -->
          <video
            bind:this={videoEl}
            src={videoUrl}
            onloadedmetadata={onVideoLoadedMetadata}
            ontimeupdate={onTimeUpdate}
            class="main-video"
          ></video>
        </div>
        <div class="player-controls">
          <button type="button" class="play-btn" onclick={togglePlay}>
            {#if isPlaying}
              <Pause size={15} />
            {:else}
              <Play size={15} />
            {/if}
          </button>
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.05"
            value={currentTime}
            oninput={(e) => seekVideo(Number(e.target.value))}
            class="seek-bar"
          />
          <span class="time-label mono">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>
        </div>
      {:else}
        <div class="empty-video-placeholder">
          <Film size={36} class="text-muted" />
          <span class="placeholder-text">Load a video to preview and scrub frames</span>
        </div>
      {/if}
    </div>

    <!-- Extracted Frames Gallery -->
    <div class="gallery-container">
      <div class="gallery-header">
        <span class="gallery-title">Extracted Frames ({extractedFrames.length})</span>
        {#if extractedFrames.length > 0}
          <div class="gallery-actions">
            <Button variant="secondary" size="sm" onclick={downloadAllFrames}>
              <Download size={13} />
              <span>Download All</span>
            </Button>
            <Button variant="ghost" size="sm" onclick={clearFrames}>
              <Trash2 size={13} />
              <span>Clear</span>
            </Button>
          </div>
        {/if}
      </div>

      {#if extractedFrames.length > 0}
        <div class="frames-grid">
          {#each extractedFrames as frame (frame.id)}
            <div class="frame-card">
              <img src={frame.url} alt="Frame at {frame.time}s" class="frame-thumb" />
              <div class="frame-info">
                <span class="frame-time mono">{frame.time}s</span>
                <span class="frame-dim mono">{frame.width}x{frame.height}</span>
                <button
                  type="button"
                  class="frame-dl-btn"
                  onclick={() => downloadFrame(frame)}
                  title="Download Frame"
                >
                  <Download size={12} />
                </button>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="empty-gallery">
          <Image size={24} class="text-muted" />
          <span class="empty-text">No frames captured yet. Use the controls above.</span>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .tool-layout {
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 16px;
    height: 100%;
    overflow: hidden;
  }

  .controls-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
    padding-right: 6px;
  }

  .panel-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .section-title {
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-secondary);
    letter-spacing: 0.5px;
  }

  .video-info-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xs);
    padding: 8px 10px;
  }

  .info-meta {
    flex: 1;
    overflow: hidden;
  }

  .file-name {
    display: block;
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-sub {
    font-size: 10px;
    color: var(--text-muted);
  }

  .mode-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    background: var(--bg-primary);
    padding: 3px;
    border-radius: var(--radius-xs);
    border: 1px solid var(--border-default);
  }

  .mode-btn {
    padding: 6px 0;
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-secondary);
    border-radius: var(--radius-xs);
    transition: all var(--transition-fast);
  }

  .mode-btn.active {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    box-shadow: var(--shadow-sm);
  }

  .preview-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    overflow-y: auto;
  }

  .player-container {
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .video-wrapper {
    height: 240px;
    background: #000000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .main-video {
    max-width: 100%;
    max-height: 100%;
  }

  .player-controls {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: var(--bg-primary);
    border-top: 1px solid var(--border-subtle);
  }

  .play-btn {
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
  }

  .seek-bar {
    flex: 1;
    height: 4px;
    accent-color: var(--accent);
  }

  .time-label {
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }

  .empty-video-placeholder {
    height: 240px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: var(--bg-primary);
  }

  .placeholder-text {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  .gallery-container {
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    min-height: 200px;
  }

  .gallery-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .gallery-title {
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .gallery-actions {
    display: flex;
    gap: 8px;
  }

  .frames-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px;
    max-height: 280px;
    overflow-y: auto;
  }

  .frame-card {
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xs);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .frame-thumb {
    width: 100%;
    height: 80px;
    object-fit: cover;
  }

  .frame-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 6px;
    background: var(--bg-tertiary);
  }

  .frame-time {
    font-size: 10px;
    color: var(--accent);
    font-weight: 600;
  }

  .frame-dim {
    font-size: 9px;
    color: var(--text-muted);
  }

  .frame-dl-btn {
    color: var(--text-secondary);
    padding: 2px;
  }

  .frame-dl-btn:hover {
    color: var(--accent);
  }

  .empty-gallery {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 120px;
  }

  .empty-text {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }
</style>
