<script>
  import { Search, Command, Wrench, Settings, User } from '@lucide/svelte';
  import { searchQuery, activeToolId } from '$lib/stores/tools.js';

  let searchInputEl;

  function handleKeydown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchInputEl?.focus();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<header class="app-header">
  <!-- Brand -->
  <div class="brand-section">
    <div class="logo-box">
      <Wrench size={16} class="logo-icon" />
    </div>
    <div class="brand-text">
      <span class="brand-name">PixelKit</span>
      <span class="badge badge-accent">PRO</span>
    </div>
  </div>

  <!-- Global Tool Search -->
  <div class="search-section">
    <div class="search-bar">
      <Search size={14} class="search-icon" />
      <input
        bind:this={searchInputEl}
        bind:value={$searchQuery}
        type="text"
        placeholder="Search tools, tags, animation, video... (Ctrl+K)"
        class="search-input"
      />
      {#if $searchQuery}
        <button
          type="button"
          class="clear-search-btn"
          onclick={() => $searchQuery = ''}
        >
          ✕
        </button>
      {:else}
        <div class="kbd-badge mono">
          <span>Ctrl K</span>
        </div>
      {/if}
    </div>
  </div>

  <!-- Header Actions -->
  <div class="actions-section">
    <div class="status-pill">
      <span class="pulse-dot"></span>
      <span class="status-text">Local Engine Active</span>
    </div>
    <button type="button" class="icon-btn" title="Settings">
      <Settings size={16} />
    </button>
    <button type="button" class="user-btn" title="Local Profile">
      <div class="user-avatar">
        <User size={14} />
      </div>
      <span class="user-name">Developer</span>
    </button>
  </div>
</header>

<style>
  .app-header {
    height: var(--header-height);
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    gap: 16px;
    flex-shrink: 0;
  }

  .brand-section {
    display: flex;
    align-items: center;
    gap: 10px;
    width: var(--sidebar-width);
  }

  .logo-box {
    width: 28px;
    height: 28px;
    background: var(--accent);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(59, 130, 246, 0.4);
  }

  :global(.logo-icon) {
    color: #ffffff;
  }

  .brand-text {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .brand-name {
    font-size: var(--text-md);
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.2px;
  }

  .search-section {
    flex: 1;
    max-width: 480px;
  }

  .search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    padding: 0 10px;
    height: 32px;
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }

  .search-bar:focus-within {
    border-color: var(--border-focus);
    box-shadow: 0 0 0 1px var(--border-focus);
    background: var(--bg-tertiary);
  }

  :global(.search-icon) {
    color: var(--text-muted);
  }

  .search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-primary);
    font-size: var(--text-xs);
  }

  .search-input::placeholder {
    color: var(--text-muted);
  }

  .clear-search-btn {
    font-size: var(--text-xs);
    color: var(--text-muted);
    padding: 2px 4px;
    border-radius: 2px;
  }

  .clear-search-btn:hover {
    color: var(--text-primary);
  }

  .kbd-badge {
    font-size: 10px;
    color: var(--text-muted);
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    padding: 2px 6px;
    border-radius: var(--radius-xs);
  }

  .actions-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .status-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-xs);
  }

  .pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--success);
    box-shadow: 0 0 6px var(--success);
  }

  .status-text {
    font-size: 11px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .icon-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-sm);
    color: var(--text-secondary);
    border: 1px solid var(--border-subtle);
    background: var(--bg-secondary);
    transition: all var(--transition-fast);
  }

  .icon-btn:hover {
    color: var(--text-primary);
    border-color: var(--border-default);
  }

  .user-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    transition: all var(--transition-fast);
  }

  .user-btn:hover {
    border-color: var(--border-default);
  }

  .user-avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-default);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
  }

  .user-name {
    font-size: var(--text-xs);
    font-weight: 500;
  }
</style>
