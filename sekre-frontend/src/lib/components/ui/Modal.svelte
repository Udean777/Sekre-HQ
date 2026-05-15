<script lang="ts">
  import type { Snippet } from "svelte";
  import { X } from "lucide-svelte";

  interface Props {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    size?: "sm" | "md" | "lg" | "xl";
    closable?: boolean;
    children?: Snippet;
  }

  let {
    isOpen,
    title,
    onClose,
    size = "md",
    closable = true,
    children,
  }: Props = $props();

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  // Close on Escape key
  $effect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closable) onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  });

  // Prevent body scroll when modal open
  $effect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  });
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <!-- Backdrop -->
    {#if closable}
      <button
        type="button"
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-75 cursor-default"
        onclick={onClose}
        aria-label="Close modal"
      ></button>
    {:else}
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-75"
      ></div>
    {/if}

    <!-- Modal -->
    <div class="flex min-h-full items-center justify-center p-4">
      <div
        class="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full {sizeClasses[
          size
        ]} dark:bg-gray-800"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700"
        >
          <h3
            id="modal-title"
            class="text-lg font-semibold text-gray-900 dark:text-gray-100"
          >
            {title}
          </h3>
          {#if closable}
            <button
              type="button"
              class="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded dark:hover:text-gray-300"
              onclick={onClose}
            >
              <span class="sr-only">Close</span>
              <X class="h-6 w-6" />
            </button>
          {/if}
        </div>

        <!-- Content -->
        <div class="px-6 py-4">
          {#if children}
            {@render children()}
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
