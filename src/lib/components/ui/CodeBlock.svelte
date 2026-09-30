<script>
  import { Copy, Check } from '@lucide/svelte';

  let {
    code = '',
    language = 'css',
    title = '',
    showCopy = true
  } = $props();

  let copied = $state(false);
  let timeoutId;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        copied = false;
      }, 1500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  }
</script>

<div class="code-container">
  {#if title || showCopy}
    <div class="code-header">
      <span class="code-title">{title || language.toUpperCase()}</span>
      {#if showCopy}
        <button
          type="button"
          class="copy-btn"
          class:copied
          onclick={copyCode}
          title="Copy to clipboard"
        >
          {#if copied}
            <Check size={13} />
            <span>Copied!</span>
          {:else}
            <Copy size={13} />
            <span>Copy</span>
          {/if}
        </button>
      {/if}
    </div>
  {/if}
  <pre class="code-body"><code>{code}</code></pre>
</div>

<style>
  .code-container {
    background: var(--bg-primary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 10px;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-subtle);
  }

  .code-title {
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--text-muted);
    font-weight: 600;
  }

  .copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--text-xs);
    color: var(--text-secondary);
    padding: 2px 6px;
    border-radius: var(--radius-xs);
    background: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    transition: all var(--transition-fast);
  }

  .copy-btn:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
  }

  .copy-btn.copied {
    color: var(--success);
    border-color: rgba(34, 197, 94, 0.4);
    background: var(--success-subtle);
  }

  .code-body {
    padding: 10px 12px;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    line-height: 1.6;
    color: #9cdcfe;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>
