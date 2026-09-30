<script>
  import { Slider, Select, Button, CodeBlock, Toggle } from '$lib/components/ui/index.js';
  import { Plus, Trash2, Eye, EyeOff, Copy } from '@lucide/svelte';
  import { toast } from '$lib/stores/toast.js';

  let layers = $state([
    { id: 1, active: true, inset: false, x: 0, y: 10, blur: 25, spread: -5, color: '#000000', opacity: 50 },
    { id: 2, active: true, inset: false, x: 0, y: 8, blur: 10, spread: -6, color: '#000000', opacity: 40 }
  ]);

  let activeLayerIndex = $state(0);
  let cardRadius = $state(8);
  let cardColor = $state('#202026');
  let canvasBg = $state('#121215');

  const presets = [
    {
      name: 'Pro Card Subtle',
      layers: [
        { id: 1, active: true, inset: false, x: 0, y: 1, blur: 3, spread: 0, color: '#000000', opacity: 30 },
        { id: 2, active: true, inset: false, x: 0, y: 4, blur: 12, spread: -2, color: '#000000', opacity: 40 }
      ]
    },
    {
      name: 'Floating Modal',
      layers: [
        { id: 1, active: true, inset: false, x: 0, y: 20, blur: 40, spread: -10, color: '#000000', opacity: 60 },
        { id: 2, active: true, inset: false, x: 0, y: 1, blur: 4, spread: 0, color: '#000000', opacity: 20 }
      ]
    },
    {
      name: 'Inner Well / Input',
      layers: [
        { id: 1, active: true, inset: true, x: 0, y: 2, blur: 4, spread: 0, color: '#000000', opacity: 60 },
        { id: 2, active: true, inset: true, x: 0, y: 0, blur: 1, spread: 0, color: '#000000', opacity: 40 }
      ]
    },
    {
      name: 'Crisp Cyber Accent',
      layers: [
        { id: 1, active: true, inset: false, x: 0, y: 0, blur: 16, spread: 2, color: '#3b82f6', opacity: 45 },
        { id: 2, active: true, inset: false, x: 0, y: 4, blur: 8, spread: -1, color: '#000000', opacity: 70 }
      ]
    }
  ];

  let nextId = 3;

  function hexToRgba(hex, opacityPercent) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    const a = (opacityPercent / 100).toFixed(2);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  function addLayer() {
    if (layers.length >= 6) {
      toast.warning('Maximum 6 shadow layers allowed');
      return;
    }
    layers.push({
      id: nextId++,
      active: true,
      inset: false,
      x: 0,
      y: 4,
      blur: 8,
      spread: 0,
      color: '#000000',
      opacity: 35
    });
    activeLayerIndex = layers.length - 1;
    toast.success('Shadow layer added');
  }

  function removeLayer(index) {
    if (layers.length <= 1) {
      toast.warning('At least 1 layer is required');
      return;
    }
    layers = layers.filter((_, i) => i !== index);
    if (activeLayerIndex >= layers.length) {
      activeLayerIndex = layers.length - 1;
    }
  }

  function applyPreset(preset) {
    layers = preset.layers.map(l => ({ ...l }));
    activeLayerIndex = 0;
    toast.success(`Preset "${preset.name}" applied`);
  }

  let currentLayer = $derived(layers[activeLayerIndex] || layers[0]);

  let shadowCss = $derived.by(() => {
    const activeLayers = layers.filter(l => l.active);
    if (activeLayers.length === 0) return 'none';
    return activeLayers.map(l => {
      const insetStr = l.inset ? 'inset ' : '';
      const colorStr = hexToRgba(l.color, l.opacity);
      return `${insetStr}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${colorStr}`;
    }).join(',\n    ');
  });

  let fullCssOutput = $derived(
    `box-shadow: ${shadowCss};\nborder-radius: ${cardRadius}px;`
  );
</script>

<div class="tool-layout">
  <div class="controls-column">
    <!-- Layers List -->
    <div class="panel-section">
      <div class="section-header">
        <h3>Shadow Layers ({layers.length})</h3>
        <Button variant="secondary" size="sm" onclick={addLayer}>
          <Plus size={13} />
          <span>Add Layer</span>
        </Button>
      </div>

      <div class="layers-list">
        {#each layers as layer, i (layer.id)}
          <div
            class="layer-item"
            class:selected={activeLayerIndex === i}
            onclick={() => activeLayerIndex = i}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === 'Enter' && (activeLayerIndex = i)}
          >
            <button
              type="button"
              class="layer-toggle-btn"
              onclick={(e) => { e.stopPropagation(); layer.active = !layer.active; }}
              title={layer.active ? 'Disable layer' : 'Enable layer'}
            >
              {#if layer.active}
                <Eye size={13} />
              {:else}
                <EyeOff size={13} />
              {/if}
            </button>
            <span class="layer-title">Layer {i + 1} {layer.inset ? '(Inset)' : ''}</span>
            <span class="layer-meta mono">{layer.x}px {layer.y}px {layer.blur}px</span>
            <button
              type="button"
              class="layer-del-btn"
              disabled={layers.length <= 1}
              onclick={(e) => { e.stopPropagation(); removeLayer(i); }}
              title="Delete layer"
            >
              <Trash2 size={13} />
            </button>
          </div>
        {/each}
      </div>
    </div>

    <!-- Active Layer Parameters -->
    {#if currentLayer}
      <div class="panel-section">
        <div class="section-header">
          <h3>Edit Layer {activeLayerIndex + 1}</h3>
          <Toggle
            label="Inset Shadow"
            bind:checked={currentLayer.inset}
          />
        </div>

        <Slider
          label="X Offset"
          unit="px"
          min={-50}
          max={50}
          bind:value={currentLayer.x}
        />
        <Slider
          label="Y Offset"
          unit="px"
          min={-50}
          max={50}
          bind:value={currentLayer.y}
        />
        <Slider
          label="Blur Radius"
          unit="px"
          min={0}
          max={100}
          bind:value={currentLayer.blur}
        />
        <Slider
          label="Spread Radius"
          unit="px"
          min={-30}
          max={50}
          bind:value={currentLayer.spread}
        />

        <div class="color-opacity-row">
          <div class="color-picker-block">
            <span class="color-label">Color</span>
            <div class="picker-input-wrap">
              <input
                type="color"
                bind:value={currentLayer.color}
                class="shadow-color-picker"
              />
              <span class="mono hex-label">{currentLayer.color}</span>
            </div>
          </div>
          <div class="opacity-block">
            <Slider
              label="Opacity"
              unit="%"
              min={0}
              max={100}
              bind:value={currentLayer.opacity}
            />
          </div>
        </div>
      </div>
    {/if}

    <!-- Canvas & Card Options -->
    <div class="panel-section">
      <h3 class="section-title">Canvas Settings</h3>
      <Slider
        label="Border Radius"
        unit="px"
        min={0}
        max={40}
        bind:value={cardRadius}
      />
      <div class="colors-row">
        <div class="color-picker-block">
          <span class="color-label">Card Background</span>
          <input type="color" bind:value={cardColor} class="shadow-color-picker" />
        </div>
        <div class="color-picker-block">
          <span class="color-label">Canvas Background</span>
          <input type="color" bind:value={canvasBg} class="shadow-color-picker" />
        </div>
      </div>
    </div>

    <!-- Presets -->
    <div class="panel-section">
      <h3 class="section-title">Presets</h3>
      <div class="presets-grid">
        {#each presets as preset}
          <button
            type="button"
            class="preset-btn"
            onclick={() => applyPreset(preset)}
          >
            {preset.name}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Preview Area -->
  <div class="preview-column">
    <div class="canvas-viewport" style="background-color: {canvasBg}">
      <div
        class="preview-card"
        style="
          background-color: {cardColor};
          border-radius: {cardRadius}px;
          box-shadow: {shadowCss};
        "
      >
        <span class="card-indicator">Active Elevation</span>
        <div class="card-subtext">Adjust sliders to refine depth</div>
      </div>
    </div>

    <div class="output-container">
      <CodeBlock code={fullCssOutput} language="css" title="BOX-SHADOW CSS" />
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

  .layers-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .layer-item {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xs);
    padding: 6px 8px;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .layer-item:hover {
    border-color: var(--border-default);
  }

  .layer-item.selected {
    border-color: var(--accent);
    background: var(--accent-subtle);
  }

  .layer-toggle-btn {
    color: var(--text-muted);
    padding: 2px;
  }

  .layer-toggle-btn:hover {
    color: var(--text-primary);
  }

  .layer-title {
    font-size: var(--text-xs);
    font-weight: 500;
    flex: 1;
    color: var(--text-primary);
  }

  .layer-meta {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  .layer-del-btn {
    color: var(--text-muted);
    padding: 2px;
  }

  .layer-del-btn:not(:disabled):hover {
    color: var(--error);
  }

  .layer-del-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .color-opacity-row {
    display: grid;
    grid-template-columns: 110px 1fr;
    gap: 12px;
    align-items: flex-end;
  }

  .color-picker-block {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .color-label {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    font-weight: 500;
  }

  .picker-input-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
    background: var(--bg-primary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xs);
    padding: 2px 6px;
  }

  .shadow-color-picker {
    -webkit-appearance: none;
    border: none;
    width: 20px;
    height: 20px;
    cursor: pointer;
    background: none;
  }

  .shadow-color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .shadow-color-picker::-webkit-color-swatch {
    border: 1px solid var(--border-subtle);
    border-radius: 2px;
  }

  .hex-label {
    font-size: var(--text-xs);
    color: var(--text-primary);
  }

  .opacity-block {
    flex: 1;
  }

  .colors-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
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
    border-color: var(--border-default);
    color: var(--text-primary);
    background: var(--bg-hover);
  }

  .preview-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    overflow-y: auto;
  }

  .canvas-viewport {
    height: 320px;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    transition: background-color var(--transition-fast);
  }

  .preview-card {
    width: 220px;
    height: 160px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: box-shadow 120ms ease, border-radius 120ms ease;
  }

  .card-indicator {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
  }

  .card-subtext {
    font-size: var(--text-xs);
    color: var(--text-muted);
  }

  .output-container {
    flex: 1;
  }
</style>
