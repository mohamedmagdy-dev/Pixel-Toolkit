<script>
  import {
    activeToolId,
    activeCategory,
    currentView,
    favorites,
    openTool,
    openCategory
  } from '$lib/stores/tools.js';
  import { categories, toolRegistry } from '$lib/tools/registry.js';
  import { Star, Grid, LayoutGrid, Sparkles, Film, Image, Palette, PenTool, Layers } from '@lucide/svelte';

  const favoriteTools = $derived(
    toolRegistry.filter(t => $favorites.includes(t.id))
  );

  function handleCategoryClick(catId) {
    openCategory(catId);
  }

  function handleToolClick(toolId) {
    openTool(toolId);
  }
</script>

<aside class="app-sidebar">
  <!-- Main Categories Navigation -->
  <div class="sidebar-section">
    <div class="section-title-row">
      <span class="section-heading">Workspaces & Studios</span>
      <LayoutGrid size={11} class="text-muted" />
    </div>

    <div class="category-nav-list">
      {#each categories as cat}
        {@const Icon = cat.icon}
        {@const toolCount = cat.id === 'all' 
          ? toolRegistry.length 
          : toolRegistry.filter(t => t.category === cat.id).length}
        {@const isCatActive = $activeCategory === cat.id}

        <button
          type="button"
          class="category-nav-btn"
          class:active={isCatActive}
          onclick={() => handleCategoryClick(cat.id)}
          title="{cat.label} ({toolCount} tools)"
        >
          <div class="cat-icon-frame">
            <Icon size={16} class="cat-nav-icon" />
          </div>
          
          <div class="cat-label-wrap">
            <span class="cat-nav-label">{cat.label}</span>
          </div>

          <span class="cat-badge-count">{toolCount}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Pinned / Favorites Section -->
  <div class="sidebar-section fav-section">
    <div class="section-title-row">
      <span class="section-heading">Quick Favorites</span>
      <Star size={11} class="text-warning" fill="currentColor" />
    </div>

    {#if favoriteTools.length > 0}
      <div class="fav-tools-list">
        {#each favoriteTools as tool (tool.id)}
          {@const ToolIcon = tool.icon}
          {@const isThisToolActive = $currentView === 'tool' && $activeToolId === tool.id}

          <button
            type="button"
            class="fav-tool-btn"
            class:active={isThisToolActive}
            onclick={() => handleToolClick(tool.id)}
          >
            <ToolIcon size={14} class="fav-icon" />
            <span class="fav-name">{tool.name}</span>
          </button>
        {/each}
      </div>
    {:else}
      <div class="empty-favs">
        <span class="empty-fav-text">Star any tool to pin here</span>
      </div>
    {/if}
  </div>

  <!-- Catalog View Shortcut -->
  <div class="sidebar-footer-section">
    <button
      type="button"
      class="catalog-view-btn"
      class:is-active={$currentView === 'grid' && $activeCategory === 'all'}
      onclick={() => handleCategoryClick('all')}
    >
      <Grid size={14} />
      <span>All Tools Catalog</span>
    </button>
  </div>
</aside>

<style>
  .app-sidebar {
    width: var(--sidebar-width);
    background: var(--bg-primary);
    border-right: 1px solid var(--border-subtle);
    display: flex;
    flex-direction: column;
    padding: 14px 10px;
    gap: 20px;
    overflow-y: auto;
    flex-shrink: 0;
    user-select: none;
  }

  .sidebar-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .fav-section {
    flex: 1;
  }

  .section-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 6px 2px;
  }

  .section-heading {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--text-muted);
    letter-spacing: 0.6px;
  }

  /* Category Navigation Buttons */
  .category-nav-list {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .category-nav-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    font-size: var(--text-xs);
    font-weight: 500;
    transition: all var(--transition-fast);
    background: transparent;
    border: 1px solid transparent;
    text-align: left;
    cursor: pointer;
  }

  .category-nav-btn:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
    border-color: var(--border-subtle);
  }

  .category-nav-btn.active {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border-color: var(--border-default);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }

  .cat-icon-frame {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    transition: color var(--transition-fast);
  }

  .category-nav-btn:hover .cat-icon-frame,
  .category-nav-btn.active .cat-icon-frame {
    color: var(--accent);
  }

  .cat-label-wrap {
    flex: 1;
    overflow: hidden;
  }

  .cat-nav-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }

  .cat-badge-count {
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--text-muted);
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    padding: 1px 6px;
    border-radius: 999px;
    transition: all var(--transition-fast);
  }

  .category-nav-btn.active .cat-badge-count {
    background: var(--accent-subtle);
    border-color: var(--accent);
    color: var(--accent);
    font-weight: 600;
  }

  /* Favorites */
  .fav-tools-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .fav-tool-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: var(--radius-xs);
    color: var(--text-secondary);
    font-size: var(--text-xs);
    background: transparent;
    border: 1px solid transparent;
    text-align: left;
    transition: all var(--transition-fast);
    cursor: pointer;
  }

  .fav-tool-btn:hover {
    color: var(--text-primary);
    background: var(--bg-hover);
  }

  .fav-tool-btn.active {
    background: var(--accent-subtle);
    color: var(--accent);
    border-color: var(--border-default);
    font-weight: 500;
  }

  :global(.fav-icon) {
    color: var(--text-muted);
    flex-shrink: 0;
  }

  .fav-tool-btn.active :global(.fav-icon) {
    color: var(--accent);
  }

  .fav-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .empty-favs {
    padding: 10px 8px;
    border: 1px dashed var(--border-subtle);
    border-radius: var(--radius-xs);
    text-align: center;
  }

  .empty-fav-text {
    font-size: 10px;
    color: var(--text-muted);
  }

  /* Footer */
  .sidebar-footer-section {
    padding-top: 10px;
    border-top: 1px solid var(--border-subtle);
  }

  .catalog-view-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: var(--radius-xs);
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    font-size: var(--text-xs);
    font-weight: 500;
    transition: all var(--transition-fast);
    cursor: pointer;
  }

  .catalog-view-btn:hover,
  .catalog-view-btn.is-active {
    color: var(--text-primary);
    border-color: var(--border-default);
    background: var(--bg-hover);
  }
</style>
