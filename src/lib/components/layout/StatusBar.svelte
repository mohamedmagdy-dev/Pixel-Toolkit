<script>
  import { activeToolId, currentView, activeCategory, filteredTools } from '$lib/stores/tools.js';
  import { getToolById, categories } from '$lib/tools/registry.js';
  import { Database, Cpu, LayoutGrid, Wrench, ShieldCheck } from '@lucide/svelte';

  let currentTool = $derived(getToolById($activeToolId));
  let currentCat = $derived(
    categories.find(c => c.id === $activeCategory) || { label: 'All Tools' }
  );
</script>

<footer class="app-statusbar">
  <div class="status-left">
    {#if $currentView === 'grid'}
      <div class="status-cell">
        <LayoutGrid size={12} class="text-accent" />
        <span class="status-label">Studio:</span>
        <span class="status-val text-accent">{currentCat.label}</span>
      </div>
      <div class="status-divider"></div>
      <div class="status-cell">
        <span class="status-label">Available:</span>
        <span class="status-val">{$filteredTools.length} Tools</span>
      </div>
    {:else}
      <div class="status-cell">
        <span class="dot-online"></span>
        <span class="status-label">Active:</span>
        <span class="status-val">{currentTool.name}</span>
      </div>
      <div class="status-divider"></div>
      <div class="status-cell">
        <span class="status-label">Category:</span>
        <span class="status-val text-accent">{currentTool.category.toUpperCase()}</span>
      </div>
    {/if}
  </div>

  <div class="status-right">
    <div class="status-cell">
      <Database size={12} class="text-muted" />
      <span class="status-val mono">SQLite Local DB</span>
    </div>
    <div class="status-divider"></div>
    <div class="status-cell">
      <Cpu size={12} class="text-muted" />
      <span class="status-val mono">Tauri 2 Rust Core</span>
    </div>
    <div class="status-divider"></div>
    <div class="status-cell">
      <ShieldCheck size={12} class="text-success" />
      <span class="status-val">Ready</span>
    </div>
  </div>
</footer>

<style>
  .app-statusbar {
    height: var(--statusbar-height);
    background: var(--bg-primary);
    border-top: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;
    font-size: 11px;
    color: var(--text-secondary);
    user-select: none;
    flex-shrink: 0;
  }

  .status-left, .status-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .status-cell {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .status-divider {
    width: 1px;
    height: 12px;
    background: var(--border-subtle);
  }

  .dot-online {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--success);
    box-shadow: 0 0 6px var(--success);
  }

  .status-label {
    color: var(--text-muted);
  }

  .status-val {
    color: var(--text-secondary);
    font-weight: 500;
  }

  .mono {
    font-family: var(--font-mono);
  }
</style>
