/**
 * Toast Store - Svelte 5 Runes
 * Manages toast notifications globally
 */

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

class ToastStore {
  toasts = $state<Toast[]>([]);

  show(type: ToastType, message: string, duration = 5000): void {
    const id = crypto.randomUUID();
    const toast: Toast = { id, type, message, duration };

    this.toasts = [...this.toasts, toast];

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  dismiss(id: string): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }

  dismissAll(): void {
    this.toasts = [];
  }

  success(message: string, duration?: number): void {
    this.show("success", message, duration);
  }

  error(message: string, duration?: number): void {
    this.show("error", message, duration);
  }

  warning(message: string, duration?: number): void {
    this.show("warning", message, duration);
  }

  info(message: string, duration?: number): void {
    this.show("info", message, duration);
  }
}

export const toastStore = new ToastStore();
