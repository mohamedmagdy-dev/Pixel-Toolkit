<script>
  let {
    variant = 'secondary', // 'primary' | 'secondary' | 'ghost' | 'danger'
    size = 'md',          // 'sm' | 'md' | 'lg'
    disabled = false,
    type = 'button',
    onclick,
    title = '',
    children,
    ...rest
  } = $props();
</script>

<button
  {type}
  {disabled}
  {title}
  class="btn btn-{variant} btn-{size}"
  {onclick}
  {...rest}
>
  {@render children?.()}
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-weight: 500;
    border-radius: var(--radius-sm);
    transition: background-color var(--transition-fast), border-color var(--transition-fast), color var(--transition-fast);
    outline: none;
    white-space: nowrap;
  }

  .btn:focus-visible {
    box-shadow: 0 0 0 2px var(--border-focus);
  }

  .btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  /* Sizes */
  .btn-sm {
    padding: 3px 8px;
    font-size: var(--text-xs);
    height: 26px;
  }

  .btn-md {
    padding: 5px 12px;
    font-size: var(--text-base);
    height: 32px;
  }

  .btn-lg {
    padding: 8px 16px;
    font-size: var(--text-md);
    height: 38px;
  }

  /* Variants */
  .btn-primary {
    background: var(--accent);
    color: #ffffff;
    border: 1px solid var(--accent-hover);
  }
  .btn-primary:not(:disabled):hover {
    background: var(--accent-hover);
  }
  .btn-primary:not(:disabled):active {
    background: var(--accent-active);
  }

  .btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-default);
  }
  .btn-secondary:not(:disabled):hover {
    background: var(--bg-hover);
    border-color: var(--border-strong);
  }
  .btn-secondary:not(:disabled):active {
    background: var(--bg-active);
  }

  .btn-ghost {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid transparent;
  }
  .btn-ghost:not(:disabled):hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  .btn-danger {
    background: var(--error-subtle);
    color: var(--error);
    border: 1px solid rgba(239, 68, 68, 0.3);
  }
  .btn-danger:not(:disabled):hover {
    background: var(--error);
    color: #ffffff;
  }
</style>
