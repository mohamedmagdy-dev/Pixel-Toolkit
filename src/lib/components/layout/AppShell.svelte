<script>
  import Header from './Header.svelte';
  import Sidebar from './Sidebar.svelte';
  import StatusBar from './StatusBar.svelte';
  import CategoryGrid from './CategoryGrid.svelte';
  import { Toast } from '$lib/components/ui/index.js';
  import { activeToolId, activeCategory, currentView, favorites, toggleFavorite, backToGrid } from '$lib/stores/tools.js';
  import { getToolById, categories } from '$lib/tools/registry.js';
  import { Star, ChevronLeft, LayoutGrid, ChevronRight } from '@lucide/svelte';

  let currentTool = $derived(getToolById($activeToolId));
  let isFav = $derived($favorites.includes($activeToolId));
  let ToolComponent = $derived(currentTool.component);
  let CurrentIcon = $derived(currentTool.icon);
  
  let currentCategory = $derived(
    categories.find(c => c.id === currentTool.category) || { label: 'Tools', id: 'all' }
  );
</script>

<div class="app-shell">
  <!-- Top App Header -->
  <Header />

  <!-- Main Work Area -->
  <div class="app-body">
    <!-- Categories & Studios Navigation Sidebar -->
    <Sidebar />

    <!-- Main Dynamic Viewport -->
    <main class="tool-viewport">
      {#if $currentView === 'grid'}
        <!-- Category Tools Grid Mode -->
        <CategoryGrid />
      {:else}
        <!-- Active Tool Workspace Mode -->
        <div class="tool-header">
          <div class="tool-header-left">
            <!-- Back to Grid Button -->
            <button
              type="button"
              class="back-grid-btn"
              onclick={backToGrid}
              title="Return to {currentCategory.label} Grid"
            >
              <ChevronLeft size={16} />
              <span>Back to {currentCategory.label}</span>
            </button>

            <span class="header-divider"></span>

            <!-- Tool Title & Details -->
            <div class="tool-title-row">
              <div class="tool-icon-wrapper">
                <CurrentIcon size={18} />
              </div>
              <div class="tool-headings">
                <div class="tool-title-line">
                  <h1 class="tool-title">{currentTool.name}</h1>
                  <span class="badge badge-accent">{currentTool.category.toUpperCase()}</span>
                </div>
                <p class="tool-description">{currentTool.description}</p>
              </div>
            </div>
          </div>

          <!-- Header Right Actions -->
          <div class="tool-header-actions">
            <button
              type="button"
              class="action-btn grid-nav-shortcut"
              onclick={backToGrid}
              title="View all tools in this category"
            >
              <LayoutGrid size={13} />
              <span>Category Grid</span>
            </button>

            <button
              type="button"
              class="action-btn"
              class:is-fav={isFav}
              onclick={() => toggleFavorite(currentTool.id)}
              title={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star size={13} fill={isFav ? 'currentColor' : 'none'} />
              <span>{isFav ? 'Favorited' : 'Favorite'}</span>
            </button>
          </div>
        </div>

        <!-- Dynamic Tool Component -->
        <div class="tool-workspace">
          <ToolComponent />
        </div>
      {/if}
    </main>
  </div>

  <!-- Bottom System Status Bar -->
  <StatusBar />

  <!-- Global Toasts -->
  <Toast />
</div>

<style>
  .app-shell {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg-app);
    overflow: hidden;
  }

  .app-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }

  .tool-viewport {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--bg-app);
  }

  /* Sub-Header for Active Tool */
  .tool-header {
    height: 60px;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
    flex-shrink: 0;
  }

  .tool-header-left {
    display: flex;
    align-items: center;
    gap: 14px;
    overflow: hidden;
  }

  .back-grid-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 10px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xs);
    color: var(--text-secondary);
    font-size: var(--text-xs);
    font-weight: 500;
    transition: all var(--transition-fast);
    cursor: pointer;
    flex-shrink: 0;
  }

  .back-grid-btn:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
    border-color: var(--border-default);
  }

  .header-divider {
    width: 1px;
    height: 24px;
    background: var(--border-subtle);
    flex-shrink: 0;
  }

  .tool-title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    overflow: hidden;
  }

  .tool-icon-wrapper {
    width: 34px;
    height: 34px;
    border-radius: var(--radius-sm);
    background: var(--bg-secondary);
    border: 1px solid var(--border-default);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    flex-shrink: 0;
  }

  .tool-headings {
    display: flex;
    flex-direction: column;
    gap: 2px;
    overflow: hidden;
  }

  .tool-title-line {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tool-title {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.2px;
    margin: 0;
    white-space: nowrap;
  }

  .tool-description {
    font-size: 11px;
    color: var(--text-secondary);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tool-header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-secondary);
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xs);
    transition: all var(--transition-fast);
    cursor: pointer;
  }

  .action-btn:hover {
    color: var(--text-primary);
    border-color: var(--border-default);
    background: var(--bg-hover);
  }

  .action-btn.is-fav {
    color: var(--warning);
    border-color: rgba(245, 158, 11, 0.4);
    background: var(--warning-subtle);
  }

  .grid-nav-shortcut {
    color: var(--text-muted);
  }

  .grid-nav-shortcut:hover {
    color: var(--accent);
  }

  .tool-workspace {
    flex: 1;
    padding: 16px;
    overflow: hidden;
  }
</style>
