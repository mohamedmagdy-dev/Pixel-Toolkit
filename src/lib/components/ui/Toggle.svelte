<script>
  let {
    checked = $bindable(false),
    label = '',
    disabled = false,
    onchange
  } = $props();

  function toggle() {
    if (disabled) return;
    checked = !checked;
    onchange?.(checked);
  }
</script>

<button
  type="button"
  class="toggle-container"
  class:disabled
  onclick={toggle}
>
  <div class="toggle-switch" class:active={checked}>
    <div class="toggle-handle"></div>
  </div>
  {#if label}
    <span class="toggle-label">{label}</span>
  {/if}
</button>

<style>
  .toggle-container {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    user-select: none;
  }

  .toggle-container.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toggle-switch {
    width: 32px;
    height: 18px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-default);
    border-radius: 9px;
    position: relative;
    transition: background-color var(--transition-fast), border-color var(--transition-fast);
  }

  .toggle-switch.active {
    background: var(--accent);
    border-color: var(--accent);
  }

  .toggle-handle {
    width: 12px;
    height: 12px;
    background: #ffffff;
    border-radius: 50%;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform var(--transition-fast);
  }

  .toggle-switch.active .toggle-handle {
    transform: translateX(14px);
  }

  .toggle-label {
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }
</style>
