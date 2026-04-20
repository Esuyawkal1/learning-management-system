import { create } from "zustand";

const activeTimeouts = new Map();

const useNotificationStore = create((set, get) => ({
  toasts: [],
  notify: ({ title, message, type = "info", duration = 3500 }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    set((state) => ({
      toasts: [...state.toasts, { id, title, message, type }],
    }));

    const timeout = setTimeout(() => {
      get().removeToast(id);
    }, duration);

    activeTimeouts.set(id, timeout);

    return id;
  },
  removeToast: (id) => {
    const timeout = activeTimeouts.get(id);

    if (timeout) {
      clearTimeout(timeout);
      activeTimeouts.delete(id);
    }

    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));

export const notify = (payload) => useNotificationStore.getState().notify(payload);

export default useNotificationStore;
