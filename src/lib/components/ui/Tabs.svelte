<script>
  let {
    tabs = [], // [{ id: '...', label: '...' }]
    activeTab = $bindable(''),
    onchange
  } = $props();

  function selectTab(id) {
    activeTab = id;
    onchange?.(id);
  }
</script>

<div class="tabs-nav" role="tablist">
  {#each tabs as tab}
    <button
      type="button"
      role="tab"
      class="tab-btn"
      class:active={activeTab === tab.id}
      aria-selected={activeTab === tab.id}
      onclick={() => selectTab(tab.id)}
    >
      {#if tab.icon}
        {@const TabIcon = tab.icon}
        <TabIcon size={14} />
      {/if}
      <span>{tab.label}</span>
    </button>
  {/each}
</div>

<style>
  .tabs-nav {
    display: flex;
    align-items: center;
    gap: 2px;
    background: var(--bg-primary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    padding: 2px;
  }

  .tab-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-secondary);
    border-radius: var(--radius-xs);
    transition: background-color var(--transition-fast), color var(--transition-fast);
  }

  .tab-btn:hover {
    color: var(--text-primary);
  }

  .tab-btn.active {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  }
</style>
