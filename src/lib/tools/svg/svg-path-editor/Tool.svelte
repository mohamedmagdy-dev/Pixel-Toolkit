<script>
  import { Slider, Button, CodeBlock, Toggle } from '$lib/components/ui/index.js';
  import { Copy, Plus, Trash2, Maximize2, Move } from '@lucide/svelte';
  import { toast } from '$lib/stores/toast.js';

  let pathData = $state('M 20 80 Q 50 10 80 80 T 140 80');
  let strokeColor = $state('#3b82f6');
  let fillColor = $state('rgba(59, 130, 246, 0.15)');
  let strokeWidth = $state(3);
  let showGrid = $state(true);
  let showPoints = $state(true);
  let viewBoxSize = $state(160);

  const presets = [
    {
      name: 'Smooth Quad Wave',
      d: 'M 10 80 Q 45 20 80 80 T 150 80',
      strokeWidth: 3
    },
    {
      name: 'Geometric Star',
      d: 'M 80 15 L 98 56 L 143 56 L 107 83 L 121 125 L 80 99 L 39 125 L 53 83 L 17 56 L 62 56 Z',
      strokeWidth: 2
    },
    {
      name: 'Organic Pill Heart',
      d: 'M 80 40 C 60 10 20 20 20 55 C 20 90 80 135 80 135 C 80 135 140 90 140 55 C 140 20 100 10 80 40 Z',
      strokeWidth: 2
    },
    {
      name: 'Action Arrow Badge',
      d: 'M 25 60 L 95 60 L 95 30 L 145 80 L 95 130 L 95 100 L 25 100 Z',
      strokeWidth: 2
    }
  ];

  function applyPreset(p) {
    pathData = p.d;
    if (p.strokeWidth) strokeWidth = p.strokeWidth;
    toast.success(`Preset "${p.name}" loaded`);
  }

  let fullSvgCode = $derived(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" width="${viewBoxSize}" height="${viewBoxSize}">
  <path
    d="${pathData}"
    fill="${fillColor}"
    stroke="${strokeColor}"
    stroke-width="${strokeWidth}"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>`);
</script>

<div class="tool-layout">
  <div class="controls-column">
    <!-- Path String Input -->
    <div class="panel-section">
      <h3 class="section-title">SVG Path Data (d)</h3>
      <textarea
        bind:value={pathData}
        rows="4"
        class="path-input mono"
        placeholder="M 10 10 L 90 90..."
      ></textarea>
    </div>

    <!-- Style Properties -->
    <div class="panel-section">
      <h3 class="section-title">Appearance</h3>
      <Slider
        label="Stroke Width"
        unit="px"
        min={1}
        max={16}
        bind:value={strokeWidth}
      />
      <div class="colors-row">
        <div class="color-item">
          <span class="color-label">Stroke Color</span>
          <div class="color-picker-box">
            <input type="color" bind:value={strokeColor} class="svg-picker" />
            <span class="mono hex-text">{strokeColor}</span>
          </div>
        </div>
        <div class="color-item">
          <span class="color-label">Fill (Hex / RGBA)</span>
          <input type="text" bind:value={fillColor} class="fill-text-input mono" />
        </div>
      </div>
      <div class="toggle-group">
        <Toggle label="Show Canvas Grid" bind:checked={showGrid} />
      </div>
    </div>

    <!-- Presets -->
    <div class="panel-section">
      <h3 class="section-title">Path Shapes</h3>
      <div class="presets-grid">
        {#each presets as p}
          <button type="button" class="preset-btn" onclick={() => applyPreset(p)}>
            {p.name}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- SVG Viewport & Code Output -->
  <div class="preview-column">
    <div class="svg-stage">
      {#if showGrid}
        <div class="svg-grid-overlay"></div>
      {/if}
      <svg
        viewBox="0 0 {viewBoxSize} {viewBoxSize}"
        class="render-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={pathData}
          fill={fillColor}
          stroke={strokeColor}
          stroke-width={strokeWidth}
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <div class="output-container">
      <CodeBlock code={fullSvgCode} language="html" title="COMPLETE SVG MARKUP" />
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

  .path-input {
    width: 100%;
    background: var(--bg-primary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xs);
    padding: 8px;
    color: var(--text-primary);
    font-size: var(--text-xs);
    line-height: 1.5;
    outline: none;
    resize: vertical;
  }

  .path-input:focus {
    border-color: var(--border-focus);
  }

  .colors-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .color-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .color-label {
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }

  .color-picker-box {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--bg-primary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xs);
    padding: 2px 6px;
  }

  .svg-picker {
    -webkit-appearance: none;
    border: none;
    width: 20px;
    height: 20px;
    cursor: pointer;
    background: none;
  }

  .hex-text {
    font-size: var(--text-xs);
    color: var(--text-primary);
  }

  .fill-text-input {
    background: var(--bg-primary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xs);
    padding: 4px 6px;
    color: var(--text-primary);
    font-size: var(--text-xs);
  }

  .toggle-group {
    display: flex;
    gap: 12px;
  }

  .presets-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .preset-btn {
    padding: 6px 8px;
    font-size: var(--text-xs);
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xs);
    color: var(--text-secondary);
    text-align: left;
    transition: all var(--transition-fast);
  }

  .preset-btn:hover {
    color: var(--text-primary);
    border-color: var(--border-default);
  }

  .preview-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    overflow-y: auto;
  }

  .svg-stage {
    height: 340px;
    background: #0e0e11;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .svg-grid-overlay {
    position: absolute;
    inset: 0;
    background-size: 20px 20px;
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    pointer-events: none;
  }

  .render-svg {
    width: 240px;
    height: 240px;
    position: relative;
    z-index: 1;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4));
  }

  .output-container {
    flex: 1;
  }
</style>
