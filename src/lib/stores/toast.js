import { writable } from 'svelte/store';

function createToastStore() {
  const { subscribe, update } = writable([]);

  function show(message, type = 'info', duration = 3000) {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    update(toasts => [...toasts, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
    return id;
  }

  function dismiss(id) {
    update(toasts => toasts.filter(t => t.id !== id));
  }

  return {
    subscribe,
    show,
    success: (msg, dur) => show(msg, 'success', dur),
    error: (msg, dur) => show(msg, 'error', dur),
    info: (msg, dur) => show(msg, 'info', dur),
    warning: (msg, dur) => show(msg, 'warning', dur),
    dismiss
  };
}

export const toast = createToastStore();
