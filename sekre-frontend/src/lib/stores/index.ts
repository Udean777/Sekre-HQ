/**
 * Stores barrel export
 */

// Auth is now handled server-side via hooks.server.ts
// export { authStore } from "./auth.svelte";
// export type { AuthenticatedUser } from "./auth.svelte";

export { toastStore } from "./toast.svelte";
export type { Toast, ToastType } from "./toast.svelte";

export { modalStore } from "./modal.svelte";
export type { ModalConfig } from "./modal.svelte";

export { themeStore } from "./theme.svelte";
export type { Theme } from "./theme.svelte";
