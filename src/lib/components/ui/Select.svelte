<script>
  let {
    value = $bindable(''),
    options = [], // [{ value: '...', label: '...' }] or ['...']
    label = '',
    id = '',
    size = 'md',
    disabled = false,
    onchange
  } = $props();

  const normalizedOptions = $derived(
    options.map(opt => typeof opt === 'string' ? { value: opt, label: opt } : opt)
  );
</script>

<div class="select-wrapper">
  {#if label}
    <label for={id} class="select-label">{label}</label>
  {/if}
  <div class="select-container select-{size}" class:disabled>
    <select
      {id}
      {disabled}
      bind:value={value}
      onchange={() => onchange?.(value)}
    >
      {#each normalizedOptions as opt}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>
  </div>
</div>

<style>
  .select-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  .select-label {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .select-container {
    position: relative;
    background: var(--bg-primary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    transition: border-color var(--transition-fast);
  }

  .select-container:focus-within {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 1px var(--border-focus);
  }

  .select-sm {
    height: 26px;
    font-size: var(--text-xs);
  }

  .select-md {
    height: 32px;
    font-size: var(--text-base);
  }

  select {
    width: 100%;
    height: 100%;
    padding: 0 24px 0 8px;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    cursor: pointer;
    appearance: none;
    -webkit-appearance: none;
  }

  /* Custom dropdown arrow */
  .select-container::after {
    content: '';
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid var(--text-muted);
    pointer-events: none;
  }

  select option {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
</style>
