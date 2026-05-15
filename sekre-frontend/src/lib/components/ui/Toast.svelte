<script lang="ts">
  import { toastStore } from "$lib/stores";
  import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    X,
    Icon,
  } from "lucide-svelte";

  const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colorClasses = {
    success:
      "bg-green-50 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700",
    error:
      "bg-red-50 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700",
    warning:
      "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700",
    info: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700",
  };

  const iconColorClasses = {
    success: "text-green-500 dark:text-green-400",
    error: "text-red-500 dark:text-red-400",
    warning: "text-yellow-500 dark:text-yellow-400",
    info: "text-blue-500 dark:text-blue-400",
  };
</script>

<div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
  {#each toastStore.toasts as toast (toast.id)}
    <div
      class="pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md {colorClasses[
        toast.type
      ]}"
      role="alert"
      aria-live="polite"
    >
      <!-- svelte-ignore svelte_component_deprecated -->
      <Icon
        this={iconMap[toast.type]}
        class="h-5 w-5 shrink-0 {iconColorClasses[toast.type]}"
      />

      <p class="flex-1 text-sm font-medium">
        {toast.message}
      </p>

      <button
        type="button"
        class="shrink-0 hover:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded"
        onclick={() => toastStore.dismiss(toast.id)}
      >
        <span class="sr-only">Dismiss</span>
        <X class="h-4 w-4" />
      </button>
    </div>
  {/each}
</div>
