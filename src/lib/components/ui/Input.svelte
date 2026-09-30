<script>
  let {
    value = $bindable(''),
    placeholder = '',
    type = 'text',
    disabled = false,
    label = '',
    id = '',
    size = 'md',
    prefix = '',
    suffix = '',
    oninput,
    onchange,
    ...rest
  } = $props();
</script>

<div class="input-wrapper">
  {#if label}
    <label for={id} class="input-label">{label}</label>
  {/if}
  <div class="input-container input-{size}" class:disabled>
    {#if prefix}
      <span class="input-prefix">{prefix}</span>
    {/if}
    <input
      {id}
      {type}
      {placeholder}
      {disabled}
      bind:value={value}
      oninput={oninput}
      onchange={onchange}
      {...rest}
    />
    {#if suffix}
      <span class="input-suffix">{suffix}</span>
    {/if}
  </div>
</div>

<style>
  .input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  .input-label {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .input-container {
    display: flex;
    align-items: center;
    background: var(--bg-primary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    overflow: hidden;
  }

  .input-container:focus-within {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 1px var(--border-focus);
  }

  .input-container.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .input-sm {
    height: 26px;
    font-size: var(--text-xs);
  }

  .input-md {
    height: 32px;
    font-size: var(--text-base);
  }

  .input-lg {
    height: 38px;
    font-size: var(--text-md);
  }

  input {
    flex: 1;
    width: 100%;
    height: 100%;
    padding: 0 8px;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
  }

  input::placeholder {
    color: var(--text-muted);
  }

  .input-prefix, .input-suffix {
    padding: 0 8px;
    font-size: var(--text-xs);
    color: var(--text-muted);
    font-family: var(--font-mono);
    user-select: none;
  }
</style>
