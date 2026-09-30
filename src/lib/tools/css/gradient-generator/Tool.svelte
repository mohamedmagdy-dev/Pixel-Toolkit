<script>
  import { Slider, Select, Button, CodeBlock } from '$lib/components/ui/index.js';
  import { Plus, Trash2, Shuffle, Copy, Check } from '@lucide/svelte';
  import { toast } from '$lib/stores/toast.js';

  let type = $state('linear');
  let angle = $state(135);
  let radialShape = $state('circle');
  let conicPosition = $state('center');

  let stops = $state([
    { id: 1, color: '#3b82f6', position: 0 },
    { id: 2, color: '#8b5cf6', position: 50 },
    { id: 3, color: '#ec4899', position: 100 }
  ]);

  const presets = [
    { name: 'Cyber Blue', type: 'linear', angle: 135, stops: [{ id: 1, color: '#0f172a', position: 0 }, { id: 2, color: '#1e3a8a', position: 50 }, { id: 3, color: '#3b82f6', position: 100 }] },
    { name: 'Deep Velvet', type: 'linear', angle: 90, stops: [{ id: 1, color: '#180e29', position: 0 }, { id: 2, color: '#4c1d95', position: 50 }, { id: 3, color: '#7c3aed', position: 100 }] },
    { name: 'Carbon Fiber', type: 'linear', angle: 45, stops: [{ id: 1, color: '#111827', position: 0 }, { id: 2, color: '#1f2937', position: 50 }, { id: 3, color: '#374151', position: 100 }] },
    { name: 'Emerald Glow', type: 'radial', angle: 0, radialShape: 'circle', stops: [{ id: 1, color: '#065f46', position: 0 }, { id: 2, color: '#042f2e', position: 70 }, { id: 3, color: '#021815', position: 100 }] },
    { name: 'Amber Sunset', type: 'linear', angle: 180, stops: [{ id: 1, color: '#7c2d12', position: 0 }, { id: 2, color: '#b45309', position: 60 }, { id: 3, color: '#f59e0b', position: 100 }] },
    { name: 'Radar Sweep', type: 'conic', angle: 0, conicPosition: 'center', stops: [{ id: 1, color: '#0f172a', position: 0 }, { id: 2, color: '#0284c7', position: 50 }, { id: 3, color: '#0f172a', position: 100 }] }
  ];

  let nextId = 4;

  function addStop() {
    if (stops.length >= 8) {
      toast.warning('Maximum 8 color stops allowed');
      return;
    }
    const lastStop = stops[stops.length - 1];
    const prevStop = stops.length > 1 ? stops[stops.length - 2] : { position: 0 };
    const newPos = Math.min(100, Math.round((lastStop.position + prevStop.position) / 2));
    stops.push({ id: nextId++, color: '#60a5fa', position: newPos });
    stops.sort((a, b) => a.position - b.position);
  }

  function removeStop(id) {
    if (stops.length <= 2) {
      toast.warning('At least 2 color stops are required');
      return;
    }
    stops = stops.filter(s => s.id !== id);
  }

  function applyPreset(preset) {
    type = preset.type;
    angle = preset.angle || 0;
    if (preset.radialShape) radialShape = preset.radialShape;
    stops = preset.stops.map(s => ({ ...s }));
    toast.success(`Preset "${preset.name}" applied`);
  }

  function randomize() {
    const randomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    angle = Math.floor(Math.random() * 360);
    stops = [
      { id: 1, color: randomHex(), position: 0 },
      { id: 2, color: randomHex(), position: Math.floor(Math.random() * 60 + 20) },
      { id: 3, color: randomHex(), position: 100 }
    ];
    toast.info('Generated random gradient');
  }

  let gradientCss = $derived.by(() => {
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    const stopsStr = sorted.map(s => `${s.color} ${s.position}%`).join(', ');

    if (type === 'linear') {
      return `linear-gradient(${angle}deg, ${stopsStr})`;
    } else if (type === 'radial') {
      return `radial-gradient(${radialShape} at center, ${stopsStr})`;
    } else {
      return `conic-gradient(from ${angle}deg at ${conicPosition}, ${stopsStr})`;
    }
  });

  let fullCssOutput = $derived(
    `background: ${gradientCss};\n/* Fallback */\nbackground-color: ${stops[0]?.color || '#1a1a1a'};`
  );
</script>

<div class="tool-layout">
  <!-- Controls Panel -->
  <div class="controls-column">
    <div class="panel-section">
      <div class="section-header">
        <h3>Gradient Type</h3>
        <Button variant="ghost" size="sm" onclick={randomize} title="Randomize Colors">
          <Shuffle size={13} />
          <span>Random</span>
        </Button>
      </div>
      <div class="type-buttons">
        <button
          type="button"
          class="type-btn"
          class:active={type === 'linear'}
          onclick={() => type = 'linear'}
        >Linear</button>
        <button
          type="button"
          class="type-btn"
          class:active={type === 'radial'}
          onclick={() => type = 'radial'}
        >Radial</button>
        <button
          type="button"
          class="type-btn"
          class:active={type === 'conic'}
          onclick={() => type = 'conic'}
        >Conic</button>
      </div>
    </div>

    {#if type === 'linear' || type === 'conic'}
      <div class="panel-section">
        <Slider
          label="Angle"
          unit="°"
          min={0}
          max={360}
          bind:value={angle}
        />
      </div>
    {:else if type === 'radial'}
      <div class="panel-section">
        <Select
          label="Radial Shape"
          options={[
            { value: 'circle', label: 'Circle' },
            { value: 'ellipse', label: 'Ellipse' }
          ]}
          bind:value={radialShape}
        />
      </div>
    {/if}

    <!-- Color Stops -->
    <div class="panel-section">
      <div class="section-header">
        <h3>Color Stops ({stops.length})</h3>
        <Button variant="secondary" size="sm" onclick={addStop}>
          <Plus size={13} />
          <span>Add Stop</span>
        </Button>
      </div>

      <div class="stops-list">
        {#each stops as stop (stop.id)}
          <div class="stop-item">
            <input
              type="color"
              bind:value={stop.color}
              class="stop-color-picker"
            />
            <input
              type="text"
              bind:value={stop.color}
              class="stop-color-hex mono"
            />
            <div class="stop-slider-wrap">
              <input
                type="range"
                min="0"
                max="100"
                bind:value={stop.position}
                class="stop-range"
              />
              <span class="stop-pos mono">{stop.position}%</span>
            </div>
            <button
              type="button"
              class="stop-del-btn"
              disabled={stops.length <= 2}
              onclick={() => removeStop(stop.id)}
              title="Remove Stop"
            >
              <Trash2 size={13} />
            </button>
          </div>
        {/each}
      </div>
    </div>

    <!-- Presets -->
    <div class="panel-section">
      <h3 class="section-title">Presets</h3>
      <div class="presets-grid">
        {#each presets as preset}
          <button
            type="button"
            class="preset-card"
            onclick={() => applyPreset(preset)}
          >
            <div
              class="preset-thumb"
              style="background: {
                preset.type === 'radial' 
                  ? `radial-gradient(circle, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
                  : `linear-gradient(${preset.angle || 135}deg, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`
              }"
            ></div>
            <span class="preset-name">{preset.name}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Preview & Code Output -->
  <div class="preview-column">
    <div class="preview-box-container">
      <div class="preview-header">
        <span class="preview-title">Live Preview</span>
      </div>
      <div class="preview-canvas" style="background: {gradientCss}">
        <div class="preview-overlay-info">
          <span>{type.toUpperCase()}</span>
          {#if type !== 'radial'}
            <span>{angle}°</span>
          {/if}
          <span>{stops.length} STOPS</span>
        </div>
      </div>
    </div>

    <div class="output-container">
      <CodeBlock code={fullCssOutput} language="css" title="CSS DECLARATION" />
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
    gap: 10px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-header h3, .section-title {
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-secondary);
    letter-spacing: 0.5px;
  }

  .type-buttons {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
    background: var(--bg-primary);
    padding: 3px;
    border-radius: var(--radius-xs);
    border: 1px solid var(--border-default);
  }

  .type-btn {
    padding: 6px 0;
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-secondary);
    border-radius: var(--radius-xs);
    transition: all var(--transition-fast);
  }

  .type-btn.active {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    box-shadow: var(--shadow-sm);
  }

  .stops-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stop-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xs);
    padding: 6px 8px;
  }

  .stop-color-picker {
    -webkit-appearance: none;
    border: 1px solid var(--border-default);
    width: 24px;
    height: 24px;
    border-radius: var(--radius-xs);
    cursor: pointer;
    background: none;
    padding: 0;
  }

  .stop-color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .stop-color-picker::-webkit-color-swatch {
    border: none;
    border-radius: 2px;
  }

  .stop-color-hex {
    width: 68px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xs);
    padding: 2px 4px;
    font-size: var(--text-xs);
    color: var(--text-primary);
    text-transform: uppercase;
  }

  .stop-slider-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .stop-range {
    flex: 1;
    height: 4px;
    accent-color: var(--accent);
  }

  .stop-pos {
    font-size: var(--text-xs);
    color: var(--text-muted);
    width: 34px;
    text-align: right;
  }

  .stop-del-btn {
    color: var(--text-muted);
    padding: 2px;
    border-radius: var(--radius-xs);
    transition: color var(--transition-fast);
  }

  .stop-del-btn:not(:disabled):hover {
    color: var(--error);
  }

  .stop-del-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .presets-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .preset-card {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xs);
    padding: 6px;
    transition: border-color var(--transition-fast), background-color var(--transition-fast);
    text-align: left;
  }

  .preset-card:hover {
    border-color: var(--border-default);
    background: var(--bg-tertiary);
  }

  .preset-thumb {
    width: 24px;
    height: 24px;
    border-radius: var(--radius-xs);
    border: 1px solid var(--border-subtle);
    flex-shrink: 0;
  }

  .preset-name {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .preview-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    overflow-y: auto;
  }

  .preview-box-container {
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .preview-header {
    padding: 8px 12px;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-subtle);
  }

  .preview-title {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
  }

  .preview-canvas {
    height: 280px;
    width: 100%;
    position: relative;
    display: flex;
    align-items: flex-end;
    padding: 12px;
    transition: background 150ms ease;
  }

  .preview-overlay-info {
    display: flex;
    gap: 8px;
    background: rgba(18, 18, 21, 0.85);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 4px 8px;
    border-radius: var(--radius-xs);
    font-size: var(--text-xs);
    font-family: var(--font-mono);
    color: var(--text-primary);
  }

  .output-container {
    flex: 1;
  }
</style>
