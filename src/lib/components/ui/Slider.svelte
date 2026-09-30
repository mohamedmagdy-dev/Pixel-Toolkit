<script>
  let {
    value = $bindable(0),
    min = 0,
    max = 100,
    step = 1,
    label = '',
    unit = '',
    onchange,
    oninput
  } = $props();

  function handleInput(e) {
    value = Number(e.target.value);
    oninput?.(value);
  }
</script>

<div class="slider-group">
  <div class="slider-header">
    {#if label}
      <span class="slider-label">{label}</span>
    {/if}
    <div class="slider-value-box">
      <input
        type="number"
        {min}
        {max}
        {step}
        bind:value={value}
        class="slider-num-input"
        onchange={() => onchange?.(value)}
      />
      {#if unit}
        <span class="slider-unit">{unit}</span>
      {/if}
    </div>
  </div>
  <input
    type="range"
    {min}
    {max}
    {step}
    {value}
    oninput={handleInput}
    onchange={() => onchange?.(value)}
    class="slider-range"
  />
</div>

<style>
  .slider-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }

  .slider-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .slider-label {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    font-weight: 500;
  }

  .slider-value-box {
    display: flex;
    align-items: center;
    background: var(--bg-primary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xs);
    padding: 1px 4px;
    font-family: var(--font-mono);
  }

  .slider-num-input {
    width: 44px;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-size: var(--text-xs);
    text-align: right;
    font-family: var(--font-mono);
    -moz-appearance: textfield;
  }

  .slider-num-input::-webkit-outer-spin-button,
  .slider-num-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .slider-unit {
    font-size: var(--text-xs);
    color: var(--text-muted);
    margin-left: 2px;
  }

  .slider-range {
    -webkit-appearance: none;
    width: 100%;
    height: 4px;
    background: var(--bg-tertiary);
    border-radius: 2px;
    outline: none;
  }

  .slider-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: 2px solid var(--bg-primary);
    transition: transform var(--transition-fast), background-color var(--transition-fast);
  }

  .slider-range::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    background: var(--accent-hover);
  }

  .slider-range::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: 2px solid var(--bg-primary);
  }
</style>
