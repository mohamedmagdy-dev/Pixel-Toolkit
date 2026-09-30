<script>
  import { toast } from '$lib/stores/toast.js';
  import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from '@lucide/svelte';

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info
  };
</script>

<div class="toast-container">
  {#each $toast as item (item.id)}
    {@const Icon = icons[item.type] || Info}
    <div class="toast-item toast-{item.type}">
      <Icon size={16} class="toast-icon" />
      <span class="toast-msg">{item.message}</span>
      <button
        type="button"
        class="toast-close"
        onclick={() => toast.dismiss(item.id)}
      >
        <X size={14} />
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: calc(var(--statusbar-height) + 12px);
    right: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 9999;
    pointer-events: none;
  }

  .toast-item {
    pointer-events: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-md);
    min-width: 240px;
    max-width: 380px;
    font-size: var(--text-xs);
    animation: toast-in 150ms ease;
  }

  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .toast-msg {
    flex: 1;
    color: var(--text-primary);
  }

  .toast-close {
    color: var(--text-muted);
    padding: 2px;
    border-radius: var(--radius-xs);
    transition: color var(--transition-fast);
  }

  .toast-close:hover {
    color: var(--text-primary);
  }

  .toast-success {
    border-color: rgba(34, 197, 94, 0.4);
    background: #142419;
  }
  .toast-success :global(.toast-icon) {
    color: var(--success);
  }

  .toast-error {
    border-color: rgba(239, 68, 68, 0.4);
    background: #2b1717;
  }
  .toast-error :global(.toast-icon) {
    color: var(--error);
  }

  .toast-warning {
    border-color: rgba(245, 158, 11, 0.4);
    background: #2b2214;
  }
  .toast-warning :global(.toast-icon) {
    color: var(--warning);
  }

  .toast-info {
    border-color: var(--border-strong);
  }
  .toast-info :global(.toast-icon) {
    color: var(--accent);
  }
</style>
