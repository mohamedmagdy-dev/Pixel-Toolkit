<script>
  import { onMount, onDestroy } from 'svelte';
  import gsap from 'gsap';
  import { Slider, Select, Toggle, Button, CodeBlock } from '$lib/components/ui/index.js';
  import { Play, Pause, RotateCcw, FastForward, Rewind, Sparkles } from '@lucide/svelte';
  import { toast } from '$lib/stores/toast.js';

  let targetShape = $state('card'); // 'card' | 'circles' | 'box3d' | 'badge'
  let isPlaying = $state(true);
  let timelineProgress = $state(0);
  let timeScale = $state(1);

  // Animation properties
  let duration = $state(1.2);
  let ease = $state('power3.out');
  let repeat = $state(-1); // -1 = infinite
  let yoyo = $state(true);

  let animX = $state(80);
  let animY = $state(-30);
  let animScale = $state(1.15);
  let animRotation = $state(15);
  let animOpacity = $state(1);
  let stagger = $state(0.08);

  let animContainer;
  let currentTween = null;

  const eases = [
    'power1.out', 'power1.inOut',
    'power2.out', 'power2.inOut',
    'power3.out', 'power3.inOut',
    'power4.out',
    'back.out(1.7)', 'back.inOut(1.7)',
    'elastic.out(1, 0.3)',
    'bounce.out',
    'expo.out',
    'circ.out',
    'none'
  ];

  const presets = [
    {
      name: 'Smooth Spring Pop',
      shape: 'card',
      duration: 1.2,
      ease: 'elastic.out(1, 0.4)',
      animX: 0,
      animY: -40,
      animScale: 1.15,
      animRotation: 0,
      repeat: -1,
      yoyo: true
    },
    {
      name: 'Stagger Kinetic Wave',
      shape: 'circles',
      duration: 0.9,
      ease: 'power3.inOut',
      animX: 0,
      animY: -50,
      animScale: 0.7,
      animRotation: 45,
      stagger: 0.1,
      repeat: -1,
      yoyo: true
    },
    {
      name: 'Card Flip & Spin',
      shape: 'card',
      duration: 1.6,
      ease: 'power4.out',
      animX: 40,
      animY: 0,
      animScale: 1.05,
      animRotation: 360,
      repeat: -1,
      yoyo: false
    },
    {
      name: 'Subtle Float & Sway',
      shape: 'badge',
      duration: 2.2,
      ease: 'power1.inOut',
      animX: 15,
      animY: -20,
      animScale: 1.02,
      animRotation: 5,
      repeat: -1,
      yoyo: true
    }
  ];

  function rebuildAnimation() {
    if (!animContainer) return;
    if (currentTween) currentTween.kill();

    const targets = animContainer.querySelectorAll('.anim-target');
    if (!targets.length) return;

    // Reset initial styles
    gsap.set(targets, { clearProps: 'all' });

    currentTween = gsap.to(targets, {
      x: animX,
      y: animY,
      scale: animScale,
      rotation: animRotation,
      opacity: animOpacity,
      duration: duration,
      ease: ease,
      repeat: repeat,
      yoyo: yoyo,
      stagger: targetShape === 'circles' ? stagger : 0,
      onUpdate: () => {
        if (currentTween) {
          timelineProgress = Math.round(currentTween.progress() * 100);
        }
      }
    });

    currentTween.timeScale(timeScale);
    isPlaying = true;
  }

  function togglePlay() {
    if (!currentTween) return;
    if (isPlaying) {
      currentTween.pause();
      isPlaying = false;
    } else {
      currentTween.play();
      isPlaying = true;
    }
  }

  function restart() {
    if (!currentTween) return;
    currentTween.restart();
    isPlaying = true;
  }

  function handleScrub(val) {
    timelineProgress = val;
    if (currentTween) {
      currentTween.pause();
      isPlaying = false;
      currentTween.progress(val / 100);
    }
  }

  function updateTimeScale(speed) {
    timeScale = speed;
    if (currentTween) currentTween.timeScale(speed);
  }

  function applyPreset(p) {
    targetShape = p.shape;
    duration = p.duration;
    ease = p.ease;
    animX = p.animX;
    animY = p.animY;
    animScale = p.animScale;
    animRotation = p.animRotation;
    repeat = p.repeat;
    yoyo = p.yoyo;
    if (p.stagger !== undefined) stagger = p.stagger;

    setTimeout(() => {
      rebuildAnimation();
      toast.success(`Preset "${p.name}" applied`);
    }, 50);
  }

  $effect(() => {
    // Rebuild when shapes or anim params change
    rebuildAnimation();
  });

  onDestroy(() => {
    if (currentTween) currentTween.kill();
  });

  let generatedJsCode = $derived(`import gsap from 'gsap';

// Target elements: ${targetShape === 'circles' ? "document.querySelectorAll('.dot')" : "document.querySelector('.card')"}
gsap.to('.anim-target', {
  x: ${animX},
  y: ${animY},
  scale: ${animScale},
  rotation: ${animRotation},
  opacity: ${animOpacity},
  duration: ${duration},
  ease: '${ease}',
  repeat: ${repeat},
  yoyo: ${yoyo}${targetShape === 'circles' ? `,\n  stagger: ${stagger}` : ''}
});`);
</script>

<div class="tool-layout">
  <div class="controls-column">
    <!-- Playback Controls -->
    <div class="panel-section">
      <div class="section-header">
        <h3>Playback Controls</h3>
        <span class="mono text-muted text-xs">{timelineProgress}%</span>
      </div>

      <div class="playback-actions">
        <Button variant={isPlaying ? 'secondary' : 'primary'} size="sm" onclick={togglePlay}>
          {#if isPlaying}
            <Pause size={13} />
            <span>Pause</span>
          {:else}
            <Play size={13} />
            <span>Play</span>
          {/if}
        </Button>
        <Button variant="secondary" size="sm" onclick={restart}>
          <RotateCcw size={13} />
          <span>Restart</span>
        </Button>
        <div class="speed-selector">
          {#each [0.5, 1, 2] as spd}
            <button
              type="button"
              class="speed-btn"
              class:active={timeScale === spd}
              onclick={() => updateTimeScale(spd)}
            >
              {spd}x
            </button>
          {/each}
        </div>
      </div>

      <div class="scrubber-wrap">
        <input
          type="range"
          min="0"
          max="100"
          value={timelineProgress}
          oninput={(e) => handleScrub(Number(e.target.value))}
          class="timeline-slider"
        />
      </div>
    </div>

    <!-- Target Element -->
    <div class="panel-section">
      <h3 class="section-title">Target Element</h3>
      <div class="shape-buttons">
        {#each [
          { id: 'card', label: 'Pro Card' },
          { id: 'circles', label: 'Stagger Dots' },
          { id: 'box3d', label: 'Cube Box' },
          { id: 'badge', label: 'Pill Badge' }
        ] as s}
          <button
            type="button"
            class="shape-btn"
            class:active={targetShape === s.id}
            onclick={() => { targetShape = s.id; setTimeout(rebuildAnimation, 20); }}
          >
            {s.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- Animation Timing & Easing -->
    <div class="panel-section">
      <h3 class="section-title">Timing & Physics</h3>
      <Slider
        label="Duration"
        unit="s"
        min={0.2}
        max={4}
        step={0.1}
        bind:value={duration}
      />
      <Select
        label="Easing Function"
        options={eases}
        bind:value={ease}
      />
      <div class="toggle-row">
        <Toggle label="Yoyo (Reverse)" bind:checked={yoyo} />
        <Select
          label="Repeat"
          options={[
            { value: -1, label: 'Infinite (-1)' },
            { value: 0, label: 'Once (0)' },
            { value: 1, label: 'Twice (1)' },
            { value: 3, label: '3 Times' }
          ]}
          bind:value={repeat}
        />
      </div>
      {#if targetShape === 'circles'}
        <Slider
          label="Stagger Delay"
          unit="s"
          min={0.02}
          max={0.3}
          step={0.01}
          bind:value={stagger}
        />
      {/if}
    </div>

    <!-- Transform Coordinates -->
    <div class="panel-section">
      <h3 class="section-title">Transforms</h3>
      <div class="coord-grid">
        <Slider label="Delta X" unit="px" min={-150} max={150} bind:value={animX} />
        <Slider label="Delta Y" unit="px" min={-150} max={150} bind:value={animY} />
        <Slider label="Scale" unit="" min={0.2} max={2.2} step={0.05} bind:value={animScale} />
        <Slider label="Rotation" unit="°" min={-360} max={360} step={5} bind:value={animRotation} />
        <Slider label="Opacity" unit="" min={0} max={1} step={0.05} bind:value={animOpacity} />
      </div>
    </div>

    <!-- Presets -->
    <div class="panel-section">
      <h3 class="section-title">GSAP Presets</h3>
      <div class="presets-grid">
        {#each presets as p}
          <button type="button" class="preset-btn" onclick={() => applyPreset(p)}>
            {p.name}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Animation Canvas Viewport -->
  <div class="preview-column">
    <div class="stage-viewport">
      <div class="stage-grid-bg"></div>
      <div bind:this={animContainer} class="stage-content">
        {#if targetShape === 'card'}
          <div class="anim-target demo-card">
            <div class="card-bar"></div>
            <span class="card-title">GSAP Target</span>
            <span class="card-sub mono">scale: {animScale} | rot: {animRotation}°</span>
          </div>
        {:else if targetShape === 'circles'}
          <div class="dots-wrapper">
            {#each [1, 2, 3, 4, 5] as idx}
              <div class="anim-target demo-dot"></div>
            {/each}
          </div>
        {:else if targetShape === 'box3d'}
          <div class="anim-target demo-cube">
            <div class="cube-inner">3D</div>
          </div>
        {:else}
          <div class="anim-target demo-badge">
            <Sparkles size={14} />
            <span>Interactive Badge</span>
          </div>
        {/if}
      </div>
    </div>

    <div class="output-container">
      <CodeBlock code={generatedJsCode} language="javascript" title="GSAP CODE SNIPPET" />
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

  .playback-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .speed-selector {
    margin-left: auto;
    display: flex;
    background: var(--bg-primary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xs);
    overflow: hidden;
  }

  .speed-btn {
    padding: 3px 8px;
    font-size: var(--text-xs);
    color: var(--text-muted);
    font-family: var(--font-mono);
  }

  .speed-btn.active {
    background: var(--bg-tertiary);
    color: var(--accent);
    font-weight: 600;
  }

  .scrubber-wrap {
    width: 100%;
  }

  .timeline-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 6px;
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: 3px;
    outline: none;
  }

  .timeline-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    border: 2px solid var(--bg-app);
  }

  .shape-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
  }

  .shape-btn {
    padding: 6px;
    font-size: var(--text-xs);
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xs);
    color: var(--text-secondary);
    text-align: center;
    transition: all var(--transition-fast);
  }

  .shape-btn.active {
    background: var(--accent-subtle);
    border-color: var(--accent);
    color: var(--accent);
  }

  .toggle-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    align-items: center;
  }

  .coord-grid {
    display: flex;
    flex-direction: column;
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

  .stage-viewport {
    height: 360px;
    background: #0d0d10;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stage-grid-bg {
    position: absolute;
    inset: 0;
    background-size: 24px 24px;
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    pointer-events: none;
  }

  .stage-content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .demo-card {
    width: 170px;
    height: 110px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    padding: 12px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }

  .card-bar {
    width: 32px;
    height: 4px;
    background: var(--accent);
    border-radius: 2px;
  }

  .card-title {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
  }

  .card-sub {
    font-size: 10px;
    color: var(--text-muted);
  }

  .dots-wrapper {
    display: flex;
    gap: 14px;
  }

  .demo-dot {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 12px var(--accent-subtle);
  }

  .demo-cube {
    width: 90px;
    height: 90px;
    background: var(--bg-tertiary);
    border: 2px solid var(--accent);
    border-radius: var(--radius-xs);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  }

  .cube-inner {
    font-family: var(--font-mono);
    font-weight: 700;
    color: var(--accent);
    font-size: var(--text-lg);
  }

  .demo-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--bg-tertiary);
    border: 1px solid var(--accent);
    border-radius: 20px;
    color: var(--text-primary);
    font-size: var(--text-sm);
    font-weight: 500;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  }

  .output-container {
    flex: 1;
  }
</style>
