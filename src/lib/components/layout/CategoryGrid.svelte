<script>
  import {
    activeCategory,
    filteredTools,
    favorites,
    toggleFavorite,
    openTool,
    searchQuery
  } from '$lib/stores/tools.js';
  import { categories } from '$lib/tools/registry.js';
  import { Star, ArrowRight, Layers, Sparkles, Filter, CheckCircle2 } from '@lucide/svelte';

  let currentCategoryMeta = $derived(() => {
    if ($activeCategory === 'favorites') {
      return {
        id: 'favorites',
        label: 'Starred Favorites',
        icon: Star,
        description: 'Your pinned and frequently used professional tools'
      };
    }
    return categories.find(c => c.id === $activeCategory) || categories[0];
  });

  const categoryMeta = $derived(currentCategoryMeta());
  const CategoryIcon = $derived(categoryMeta.icon || Layers);
</script>

<div class="category-grid-container">
  <!-- Category Banner Header -->
  <header class="grid-header">
    <div class="header-main">
      <div class="header-icon-box">
        <CategoryIcon size={24} class="header-icon" />
      </div>
      <div class="header-texts">
        <div class="title-row">
          <h1 class="category-title">{categoryMeta.label}</h1>
          <span class="tool-count-badge">
            {$filteredTools.length} {$filteredTools.length === 1 ? 'Tool' : 'Tools'}
          </span>
          {#if $searchQuery}
            <span class="search-indicator">
              Filtering by: "{$searchQuery}"
            </span>
          {/if}
        </div>
        <p class="category-desc">{categoryMeta.description}</p>
      </div>
    </div>

    <!-- Quick Category Filter Pills -->
    <div class="category-pills">
      {#each categories as cat}
        {@const CatIcon = cat.icon}
        <button
          type="button"
          class="pill-btn"
          class:active={$activeCategory === cat.id}
          onclick={() => $activeCategory = cat.id}
        >
          <CatIcon size={13} />
          <span>{cat.label}</span>
        </button>
      {/each}
      <button
        type="button"
        class="pill-btn"
        class:active={$activeCategory === 'favorites'}
        onclick={() => $activeCategory = 'favorites'}
      >
        <Star size={13} fill={$activeCategory === 'favorites' ? 'currentColor' : 'none'} />
        <span>Favorites</span>
      </button>
    </div>
  </header>

  <!-- Grid of Tool Cards -->
  <div class="grid-viewport">
    {#if $filteredTools.length > 0}
      <div class="tools-grid">
        {#each $filteredTools as tool (tool.id)}
          {@const ToolIcon = tool.icon}
          {@const isFav = $favorites.includes(tool.id)}
          
          <div
            class="tool-card"
            role="button"
            tabindex="0"
            onclick={() => openTool(tool.id)}
            onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTool(tool.id); }}}
          >
            <!-- Card Top Bar -->
            <div class="card-header">
              <div class="tool-icon-frame">
                <ToolIcon size={20} class="card-tool-icon" />
              </div>

              <div class="header-meta-actions">
                <span class="category-tag">
                  {tool.category.toUpperCase()}
                </span>
                <button
                  type="button"
                  class="card-fav-btn"
                  class:is-active={isFav}
                  title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                  onclick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(tool.id);
                  }}
                >
                  <Star size={15} fill={isFav ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>

            <!-- Tool Title & Description -->
            <div class="card-content">
              <h2 class="card-tool-name">{tool.name}</h2>
              <p class="card-tool-desc">{tool.description}</p>
            </div>

            <!-- Tags -->
            {#if tool.tags && tool.tags.length > 0}
              <div class="card-tags">
                {#each tool.tags.slice(0, 3) as tag}
                  <span class="tag-chip">#{tag}</span>
                {/each}
              </div>
            {/if}

            <!-- Card Bottom Bar -->
            <div class="card-footer">
              <span class="engine-badge">
                <span class="engine-dot"></span>
                <span>Ready</span>
              </span>

              <span class="launch-action">
                <span>Launch Tool</span>
                <ArrowRight size={14} class="launch-arrow" />
              </span>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <!-- Empty State -->
      <div class="empty-grid-state">
        <div class="empty-icon-wrap">
          <Filter size={28} />
        </div>
        <h3 class="empty-title">No tools found</h3>
        <p class="empty-desc">
          {$searchQuery
            ? `No tools match your query "${$searchQuery}". Try searching for something else.`
            : 'No tools currently in this category.'}
        </p>
        {#if $searchQuery}
          <button
            type="button"
            class="btn btn-secondary clear-filter-btn"
            onclick={() => $searchQuery = ''}
          >
            Clear Search Filter
          </button>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .category-grid-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    background: var(--bg-primary);
  }

  /* Header Banner */
  .grid-header {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-subtle);
    padding: 24px 28px 18px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    flex-shrink: 0;
  }

  .header-main {
    display: flex;
    align-items: flex-start;
    gap: 16px;
  }

  .header-icon-box {
    width: 46px;
    height: 46px;
    border-radius: var(--radius-sm);
    background: var(--bg-tertiary);
    border: 1px solid var(--border-default);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    flex-shrink: 0;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  }

  .header-texts {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .category-title {
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.3px;
    margin: 0;
  }

  .tool-count-badge {
    font-size: 11px;
    font-weight: 600;
    background: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 1px solid var(--border-subtle);
    padding: 2px 8px;
    border-radius: 999px;
  }

  .search-indicator {
    font-size: 11px;
    color: var(--accent);
    font-weight: 500;
  }

  .category-desc {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    max-width: 680px;
    line-height: 1.45;
  }

  /* Pills Filter */
  .category-pills {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    border-top: 1px solid var(--border-subtle);
    padding-top: 14px;
  }

  .pill-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xs);
    color: var(--text-secondary);
    font-size: var(--text-xs);
    font-weight: 500;
    transition: all var(--transition-fast);
    cursor: pointer;
  }

  .pill-btn:hover {
    color: var(--text-primary);
    border-color: var(--border-default);
    background: var(--bg-hover);
  }

  .pill-btn.active {
    background: var(--accent);
    color: #ffffff;
    border-color: var(--accent);
    box-shadow: 0 1px 4px rgba(59, 130, 246, 0.35);
  }

  /* Grid Viewport */
  .grid-viewport {
    flex: 1;
    overflow-y: auto;
    padding: 28px;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    gap: 18px;
  }

  /* Tool Card */
  .tool-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: pointer;
    position: relative;
    outline: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .tool-card:hover {
    border-color: var(--accent);
    background: var(--bg-tertiary);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
  }

  .tool-card:focus-visible {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 2px var(--accent-subtle);
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .tool-icon-frame {
    width: 40px;
    height: 40px;
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    transition: transform var(--transition-fast), background-color var(--transition-fast);
  }

  .tool-card:hover .tool-icon-frame {
    transform: scale(1.04);
    background: var(--accent-subtle);
  }

  .header-meta-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .category-tag {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.5px;
    padding: 2px 7px;
    border-radius: 4px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-subtle);
    color: var(--text-muted);
  }

  .tool-card:hover .category-tag {
    color: var(--text-secondary);
    border-color: var(--border-default);
  }

  .card-fav-btn {
    padding: 4px;
    color: var(--text-muted);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
  }

  .card-fav-btn:hover {
    color: var(--warning);
    background: var(--bg-primary);
  }

  .card-fav-btn.is-active {
    color: var(--warning);
  }

  /* Content */
  .card-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;
  }

  .card-tool-name {
    font-size: var(--text-md);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    letter-spacing: -0.2px;
  }

  .card-tool-desc {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    line-height: 1.5;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Tags */
  .card-tags {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .tag-chip {
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--text-muted);
    background: var(--bg-primary);
    padding: 2px 6px;
    border-radius: 3px;
    border: 1px solid var(--border-subtle);
  }

  /* Footer */
  .card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid var(--border-subtle);
  }

  .engine-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: var(--text-muted);
  }

  .engine-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--success);
  }

  .launch-action {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--accent);
    transition: transform var(--transition-fast);
  }

  .tool-card:hover .launch-action {
    transform: translateX(3px);
  }

  :global(.launch-arrow) {
    transition: transform var(--transition-fast);
  }

  .tool-card:hover :global(.launch-arrow) {
    transform: translateX(2px);
  }

  /* Empty State */
  .empty-grid-state {
    padding: 60px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--text-muted);
  }

  .empty-icon-wrap {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    color: var(--text-muted);
  }

  .empty-title {
    font-size: var(--text-md);
    color: var(--text-primary);
    margin: 0 0 6px 0;
  }

  .empty-desc {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    max-width: 360px;
    margin: 0 0 16px 0;
  }

  .clear-filter-btn {
    font-size: var(--text-xs);
  }
</style>
