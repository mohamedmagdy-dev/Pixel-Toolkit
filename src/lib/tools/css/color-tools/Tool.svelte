<script>
  import { Button, CodeBlock, Slider } from '$lib/components/ui/index.js';
  import { Copy, RefreshCw, Check, Sparkles } from '@lucide/svelte';
  import { toast } from '$lib/stores/toast.js';

  let baseColor = $state('#3b82f6');
  let harmonyType = $state('complementary');

  // Conversions
  function hexToRgb(hex) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgbToHex(r, g, b) {
    const toHex = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  function hslToRgb(h, s, l) {
    h = h / 360; s = s / 100; l = l / 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  function hslToHex(h, s, l) {
    const { r, g, b } = hslToRgb(h, s, l);
    return rgbToHex(r, g, b);
  }

  // Relative luminance for contrast
  function getLuminance(r, g, b) {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function getContrastRatio(hex1, hex2) {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return ((brightest + 0.05) / (darkest + 0.05)).toFixed(2);
  }

  let rgb = $derived(hexToRgb(baseColor));
  let hsl = $derived(rgbToHsl(rgb.r, rgb.g, rgb.b));

  let whiteContrast = $derived(getContrastRatio(baseColor, '#ffffff'));
  let blackContrast = $derived(getContrastRatio(baseColor, '#000000'));

  let palette = $derived.by(() => {
    const { h, s, l } = hsl;
    let hues = [];

    if (harmonyType === 'complementary') {
      hues = [h, (h + 180) % 360, (h + 30) % 360, (h + 210) % 360, (h + 150) % 360];
    } else if (harmonyType === 'analogous') {
      hues = [(h - 40 + 360) % 360, (h - 20 + 360) % 360, h, (h + 20) % 360, (h + 40) % 360];
    } else if (harmonyType === 'triadic') {
      hues = [h, (h + 120) % 360, (h + 240) % 360, (h + 60) % 360, (h + 180) % 360];
    } else if (harmonyType === 'split-complementary') {
      hues = [h, (h + 150) % 360, (h + 210) % 360, (h + 30) % 360, (h + 330) % 360];
    } else { // monochromatic
      return [
        { hex: hslToHex(h, s, Math.max(10, l - 30)), name: 'Shade 2' },
        { hex: hslToHex(h, s, Math.max(15, l - 15)), name: 'Shade 1' },
        { hex: baseColor, name: 'Base Color' },
        { hex: hslToHex(h, s, Math.min(90, l + 15)), name: 'Tint 1' },
        { hex: hslToHex(h, s, Math.min(95, l + 30)), name: 'Tint 2' }
      ];
    }

    return hues.map((hue, idx) => ({
      hex: hslToHex(hue, s, l),
      name: idx === 0 ? 'Base' : `Harmony ${idx}`
    }));
  });

  async function copyValue(text) {
    await navigator.clipboard.writeText(text);
    toast.success(`Copied ${text}`);
  }

  function randomize() {
    baseColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    toast.info('New base color generated');
  }

  let cssTokensOutput = $derived(`:root {
  --color-base: ${baseColor};
  --color-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};
  --color-hsl: ${hsl.h}deg ${hsl.s}% ${hsl.l}%;
${palette.map((p, i) => `  --color-palette-${i + 1}: ${p.hex};`).join('\n')}
}`);
</script>

<div class="tool-layout">
  <div class="controls-column">
    <!-- Base Color Picker -->
    <div class="panel-section">
      <div class="section-header">
        <h3>Base Color</h3>
        <Button variant="ghost" size="sm" onclick={randomize}>
          <RefreshCw size={13} />
          <span>Random</span>
        </Button>
      </div>

      <div class="base-picker-box">
        <input type="color" bind:value={baseColor} class="large-color-picker" />
        <div class="color-values-list">
          <button type="button" class="value-row" onclick={() => copyValue(baseColor)}>
            <span class="value-label">HEX</span>
            <span class="value-text mono">{baseColor.toUpperCase()}</span>
            <Copy size={12} class="copy-icon" />
          </button>
          <button type="button" class="value-row" onclick={() => copyValue(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}>
            <span class="value-label">RGB</span>
            <span class="value-text mono">rgb({rgb.r}, {rgb.g}, {rgb.b})</span>
            <Copy size={12} class="copy-icon" />
          </button>
          <button type="button" class="value-row" onclick={() => copyValue(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}>
            <span class="value-label">HSL</span>
            <span class="value-text mono">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</span>
            <Copy size={12} class="copy-icon" />
          </button>
        </div>
      </div>
    </div>

    <!-- Harmony Modes -->
    <div class="panel-section">
      <h3 class="section-title">Color Harmony</h3>
      <div class="harmony-selector">
        {#each [
          { id: 'complementary', label: 'Complementary' },
          { id: 'analogous', label: 'Analogous' },
          { id: 'triadic', label: 'Triadic' },
          { id: 'split-complementary', label: 'Split Comp.' },
          { id: 'monochromatic', label: 'Monochromatic' }
        ] as h}
          <button
            type="button"
            class="harmony-btn"
            class:active={harmonyType === h.id}
            onclick={() => harmonyType = h.id}
          >
            {h.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- WCAG Contrast Ratios -->
    <div class="panel-section">
      <h3 class="section-title">WCAG Readability</h3>
      <div class="contrast-grid">
        <div class="contrast-card" style="background: {baseColor}; color: #ffffff;">
          <span class="contrast-title">White Text</span>
          <span class="contrast-ratio mono">{whiteContrast}:1</span>
          <span class="contrast-badge">{Number(whiteContrast) >= 4.5 ? 'AA Pass' : 'Fail'}</span>
        </div>
        <div class="contrast-card" style="background: {baseColor}; color: #000000;">
          <span class="contrast-title">Black Text</span>
          <span class="contrast-ratio mono">{blackContrast}:1</span>
          <span class="contrast-badge">{Number(blackContrast) >= 4.5 ? 'AA Pass' : 'Fail'}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Palette View & Output -->
  <div class="preview-column">
    <div class="palette-display-card">
      <div class="palette-header">
        <span class="palette-title">Harmonious Palette ({harmonyType.toUpperCase()})</span>
      </div>
      <div class="palette-swatches">
        {#each palette as swatch}
          <div
            class="swatch-item"
            style="background-color: {swatch.hex};"
            onclick={() => copyValue(swatch.hex)}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === 'Enter' && copyValue(swatch.hex)}
            title="Click to copy HEX"
          >
            <div class="swatch-details">
              <span class="swatch-name">{swatch.name}</span>
              <span class="swatch-hex mono">{swatch.hex.toUpperCase()}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="output-container">
      <CodeBlock code={cssTokensOutput} language="css" title="CSS COLOR TOKENS" />
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

  .base-picker-box {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .large-color-picker {
    -webkit-appearance: none;
    border: 1px solid var(--border-default);
    width: 100%;
    height: 64px;
    border-radius: var(--radius-xs);
    cursor: pointer;
    background: none;
    padding: 0;
  }

  .large-color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .large-color-picker::-webkit-color-swatch {
    border: none;
    border-radius: var(--radius-xs);
  }

  .color-values-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .value-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 8px;
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xs);
    transition: all var(--transition-fast);
  }

  .value-row:hover {
    border-color: var(--border-default);
    background: var(--bg-hover);
  }

  .value-label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-muted);
  }

  .value-text {
    font-size: var(--text-xs);
    color: var(--text-primary);
  }

  :global(.copy-icon) {
    color: var(--text-muted);
  }

  .value-row:hover :global(.copy-icon) {
    color: var(--accent);
  }

  .harmony-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .harmony-btn {
    padding: 6px 8px;
    font-size: var(--text-xs);
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xs);
    color: var(--text-secondary);
    text-align: left;
    transition: all var(--transition-fast);
  }

  .harmony-btn:hover {
    border-color: var(--border-default);
    color: var(--text-primary);
  }

  .harmony-btn.active {
    background: var(--accent-subtle);
    border-color: var(--accent);
    color: var(--accent);
    font-weight: 500;
  }

  .contrast-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .contrast-card {
    padding: 10px;
    border-radius: var(--radius-xs);
    display: flex;
    flex-direction: column;
    gap: 4px;
    border: 1px solid rgba(0, 0, 0, 0.2);
  }

  .contrast-title {
    font-size: var(--text-xs);
    font-weight: 600;
  }

  .contrast-ratio {
    font-size: var(--text-lg);
    font-weight: 700;
  }

  .contrast-badge {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    opacity: 0.85;
  }

  .preview-column {
    display: flex;
    flex-direction: column;
    gap: 16px;
    height: 100%;
    overflow-y: auto;
  }

  .palette-display-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  .palette-header {
    padding: 8px 12px;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-subtle);
  }

  .palette-title {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
  }

  .palette-swatches {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    height: 220px;
  }

  .swatch-item {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 12px;
    cursor: pointer;
    transition: transform var(--transition-fast), filter var(--transition-fast);
    position: relative;
  }

  .swatch-item:hover {
    filter: brightness(1.08);
  }

  .swatch-details {
    background: rgba(18, 18, 21, 0.85);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 6px 8px;
    border-radius: var(--radius-xs);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .swatch-name {
    font-size: 10px;
    color: var(--text-secondary);
    font-weight: 600;
    text-transform: uppercase;
  }

  .swatch-hex {
    font-size: var(--text-xs);
    color: var(--text-primary);
    font-weight: 700;
  }

  .output-container {
    flex: 1;
  }
</style>
