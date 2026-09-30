<script>
  import { UploadCloud, FileType } from '@lucide/svelte';

  let {
    accept = '*/*',
    multiple = false,
    label = 'Drop files here or click to browse',
    hint = '',
    onfiles
  } = $props();

  let isDragging = $state(false);
  let fileInput;

  function handleDrop(e) {
    e.preventDefault();
    isDragging = false;
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      onfiles?.(Array.from(e.dataTransfer.files));
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave(e) {
    e.preventDefault();
    isDragging = false;
  }

  function handleInputChange(e) {
    if (e.target.files && e.target.files.length > 0) {
      onfiles?.(Array.from(e.target.files));
    }
  }
</script>

<div
  class="dropzone"
  class:dragging={isDragging}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
  onclick={() => fileInput.click()}
  role="button"
  tabindex="0"
  onkeydown={(e) => e.key === 'Enter' && fileInput.click()}
>
  <input
    bind:this={fileInput}
    type="file"
    {accept}
    {multiple}
    class="file-input"
    onchange={handleInputChange}
  />
  <UploadCloud size={28} class="drop-icon" />
  <span class="drop-label">{label}</span>
  {#if hint}
    <span class="drop-hint">{hint}</span>
  {/if}
</div>

<style>
  .dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px 16px;
    border: 2px dashed var(--border-default);
    border-radius: var(--radius-md);
    background: var(--bg-primary);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: center;
    user-select: none;
  }

  .dropzone:hover {
    border-color: var(--accent);
    background: var(--bg-secondary);
  }

  .dropzone.dragging {
    border-color: var(--accent);
    background: var(--accent-subtle);
  }

  .file-input {
    display: none;
  }

  :global(.drop-icon) {
    color: var(--text-muted);
    transition: color var(--transition-fast);
  }

  .dropzone:hover :global(.drop-icon) {
    color: var(--accent);
  }

  .drop-label {
    font-size: var(--text-base);
    color: var(--text-primary);
    font-weight: 500;
  }

  .drop-hint {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }
</style>
