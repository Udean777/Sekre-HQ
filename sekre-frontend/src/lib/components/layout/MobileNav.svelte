<script lang="ts">
  import { page } from "$app/stores";
  import AppSidebar from "./AppSidebar.svelte";

  interface Props {
    isOpen: boolean;
    onClose: () => void;
  }

  let { isOpen = $bindable(false), onClose }: Props = $props();

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }
</script>

{#if isOpen}
  <!-- Backdrop -->
  <button
    type="button"
    class="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
    onclick={handleBackdropClick}
    aria-label="Close menu"
  ></button>

  <!-- Sidebar -->
  <div class="fixed inset-y-0 left-0 flex flex-col w-64 z-50 lg:hidden">
    <div class="relative flex-1 flex flex-col bg-gray-900">
      <!-- Close button -->
      <div class="absolute top-0 right-0 -mr-12 pt-2">
        <button
          type="button"
          class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
          onclick={onClose}
        >
          <span class="sr-only">Close sidebar</span>
          <svg
            class="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <AppSidebar />
    </div>
  </div>
{/if}
