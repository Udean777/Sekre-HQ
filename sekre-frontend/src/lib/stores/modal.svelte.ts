/**
 * Modal Store - Svelte 5 Runes
 * Manages modal state globally
 */

export interface ModalConfig {
  id: string;
  title: string;
  size?: "sm" | "md" | "lg" | "xl";
  closable?: boolean;
}

class ModalStore {
  activeModal = $state<ModalConfig | null>(null);

  // Derived state
  isOpen = $derived(this.activeModal !== null);

  open(config: Omit<ModalConfig, "id">): string {
    const id = crypto.randomUUID();
    this.activeModal = {
      id,
      ...config,
      closable: config.closable ?? true,
    };
    return id;
  }

  close(): void {
    if (this.activeModal?.closable !== false) {
      this.activeModal = null;
    }
  }

  forceClose(): void {
    this.activeModal = null;
  }

  updateTitle(title: string): void {
    if (this.activeModal) {
      this.activeModal = { ...this.activeModal, title };
    }
  }
}

export const modalStore = new ModalStore();
