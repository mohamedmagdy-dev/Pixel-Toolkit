<script>
  import { DropZone, Slider, Select, Button, Toggle } from '$lib/components/ui/index.js';
  import { Image, Download, Trash2, ArrowRight, Zap, Check } from '@lucide/svelte';
  import { toast } from '$lib/stores/toast.js';

  let originalFile = $state(null);
  let originalUrl = $state('');
  let originalSize = $state(0);
  let originalWidth = $state(0);
  let originalHeight = $state(0);

  // Settings
  let quality = $state(80);
  let targetFormat = $state('image/webp');
  let resizeEnabled = $state(false);
  let targetWidth = $state(1920);
  let targetHeight = $state(1080);
  let keepAspectRatio = $state(true);

  // Result
  let isProcessing = $state(false);
  let compressedUrl = $state('');
  let compressedSize = $state(0);
  let canvasEl;

  function handleFiles(files) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image (PNG, JPEG, WebP)');
      return;
    }

    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);

    originalFile = file;
    originalUrl = URL.createObjectURL(file);
    originalSize = file.size;

    const img = new window.Image();
    img.onload = () => {
      originalWidth = img.naturalWidth;
      originalHeight = img.naturalHeight;
      targetWidth = img.naturalWidth;
      targetHeight = img.naturalHeight;
      compressImage();
    };
    img.src = originalUrl;
    toast.success(`Loaded image: ${file.name}`);
  }

  function handleWidthChange(newW) {
    targetWidth = newW;
    if (keepAspectRatio && originalWidth > 0) {
      targetHeight = Math.round((newW / originalWidth) * originalHeight);
    }
    compressImage();
  }

  function compressImage() {
    if (!originalUrl || !canvasEl) return;
    isProcessing = true;

    const img = new window.Image();
    img.onload = () => {
      const w = resizeEnabled ? targetWidth : originalWidth;
      const h = resizeEnabled ? targetHeight : originalHeight;

      canvasEl.width = w;
      canvasEl.height = h;

      const ctx = canvasEl.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      canvasEl.toBlob((blob) => {
        if (!blob) {
          isProcessing = false;
          return;
        }
        if (compressedUrl) URL.revokeObjectURL(compressedUrl);
        compressedUrl = URL.createObjectURL(blob);
        compressedSize = blob.size;
        isProcessing = false;
      }, targetFormat, quality / 100);
    };
    img.src = originalUrl;
  }

  function downloadCompressed() {
    if (!compressedUrl) return;
    const ext = targetFormat === 'image/webp' ? 'webp' : targetFormat === 'image/jpeg' ? 'jpg' : 'png';
    const a = document.createElement('a');
    a.href = compressedUrl;
    a.download = `compressed_${Date.now()}.${ext}`;
    a.click();
    toast.success('Downloaded compressed image');
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  let savedPercent = $derived.by(() => {
    if (originalSize === 0 || compressedSize === 0) return 0;
    const diff = originalSize - compressedSize;
    return Math.max(0, Math.round((diff / originalSize) * 100));
  });
</script>

<canvas bind:this={canvasEl} style="display: none;"></canvas>

<div class="tool-layout">
  <div class="controls-column">
    <!-- Source Image -->
    <div class="panel-section">
      <h3 class="section-title">Source Image</h3>
      {#if !originalFile}
        <DropZone
          accept="image/*"
          label="Drop Image Here"
          hint="Supports PNG, JPG, WebP"
          onfiles={handleFiles}
        />
      {:else}
        <div class="source-info-box">
          <Image size={20} class="text-accent" />
          <div class="info-meta">
            <span class="file-name">{originalFile.name}</span>
            <span class="file-sub mono">{originalWidth}x{originalHeight} • {formatBytes(originalSize)}</span>
          </div>
          <Button variant="ghost" size="sm" onclick={() => { originalFile = null; originalUrl = ''; compressedUrl = ''; }}>
            <Trash2 size={13} />
          </Button>
        </div>
      {/if}
    </div>

    <!-- Compression Parameters -->
    <div class="panel-section">
      <h3 class="section-title">Compression Options</h3>
      <Select
        label="Format Target"
        options={[
          { value: 'image/webp', label: 'WebP (Modern, High Compression)' },
          { value: 'image/jpeg', label: 'JPEG (Universal Photo)' },
          { value: 'image/png', label: 'PNG (Lossless / Transparency)' }
        ]}
        bind:value={targetFormat}
        onchange={compressImage}
      />

      <Slider
        label="Quality"
        unit="%"
        min={10}
        max={100}
        bind:value={quality}
        onchange={compressImage}
      />

      <div class="resize-toggle-row">
        <Toggle
          label="Resize Image Dimensions"
          bind:checked={resizeEnabled}
          onchange={compressImage}
        />
      </div>

      {#if resizeEnabled}
        <div class="dimensions-inputs">
          <Slider
            label="Width"
            unit="px"
            min={100}
            max={originalWidth || 3840}
            bind:value={targetWidth}
            onchange={handleWidthChange}
          />
          <Slider
            label="Height"
            unit="px"
            min={100}
            max={originalHeight || 2160}
            bind:value={targetHeight}
            onchange={compressImage}
          />
        </div>
      {/if}
    </div>

    <!-- Download CTA -->
    <div class="panel-section">
      <Button
        variant="primary"
        size="lg"
        disabled={!compressedUrl || isProcessing}
        onclick={downloadCompressed}
      >
        <Download size={16} />
        <span>Download Compressed ({formatBytes(compressedSize)})</span>
      </Button>
    </div>
  </div>

  <!-- Comparison & Preview Column -->
  <div class="preview-column">
    {#if originalUrl}
      <!-- Savings Banner -->
      <div class="savings-banner">
        <div class="savings-stat">
          <span class="stat-label">ORIGINAL</span>
          <span class="stat-val mono">{formatBytes(originalSize)}</span>
        </div>
        <ArrowRight size={16} class="text-muted" />
        <div class="savings-stat">
          <span class="stat-label">COMPRESSED</span>
          <span class="stat-val text-accent mono">{formatBytes(compressedSize)}</span>
        </div>
        <div class="savings-pill">
          <Zap size={14} />
          <span>{savedPercent}% SAVED</span>
        </div>
      </div>

      <!-- Preview Image Display -->
      <div class="image-stage">
        <img src={compressedUrl || originalUrl} alt="Preview" class="preview-img" />
      </div>
    {:else}
      <div class="empty-state-box">
        <Image size={40} class="text-muted" />
        <span class="empty-title">Image Optimizer</span>
        <span class="empty-sub">Upload an image to reduce file size with zero visible loss</span>
      </div>
    {/if}
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

  .source-info-box {
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

  .resize-toggle-row {
    margin-top: 4px;
  }

  .dimensions-inputs {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .preview-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    overflow-y: auto;
  }

  .savings-banner {
    display: flex;
    align-items: center;
    gap: 16px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    padding: 12px 16px;
  }

  .savings-stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stat-label {
    font-size: 10px;
    font-weight: 600;
    color: var(--text-muted);
  }

  .stat-val {
    font-size: var(--text-md);
    font-weight: 700;
    color: var(--text-primary);
  }

  .savings-pill {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--success-subtle);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: var(--success);
    padding: 4px 10px;
    border-radius: 20px;
    font-weight: 700;
    font-size: var(--text-xs);
  }

  .image-stage {
    flex: 1;
    background: #0c0c0e;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    overflow: hidden;
  }

  .preview-img {
    max-width: 100%;
    max-height: 480px;
    object-fit: contain;
    border-radius: var(--radius-xs);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  }

  .empty-state-box {
    height: 320px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .empty-title {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
  }

  .empty-sub {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }
</style>
