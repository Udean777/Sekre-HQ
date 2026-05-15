<script lang="ts">
  import type { Snippet } from "svelte";
  import { AlertTriangle, RefreshCw } from "lucide-svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import { formatErrorForLog } from "$lib/utils/error-handler";

  interface Props {
    children?: Snippet;
    fallback?: Snippet<[Error]>;
  }

  let { children, fallback }: Props = $props();

  let error = $state<Error | null>(null);

  function handleError(e: ErrorEvent) {
    error = e.error;
    console.error("ErrorBoundary caught:", formatErrorForLog(e.error));
  }

  function retry() {
    error = null;
    window.location.reload();
  }

  // Listen for errors
  $effect(() => {
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  });
</script>

{#if error}
  {#if fallback}
    {@render fallback(error)}
  {:else}
    <!-- Default error UI -->
    <div
      class="flex flex-col items-center justify-center min-h-[400px] px-4 text-center"
    >
      <AlertTriangle class="h-16 w-16 text-red-500 dark:text-red-400 mb-4" />

      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Something went wrong
      </h2>

      <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        An unexpected error occurred. Please try refreshing the page.
      </p>

      {#if import.meta.env.DEV}
        <details class="mb-6 text-left max-w-2xl w-full">
          <summary
            class="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Error details (dev only)
          </summary>
          <pre
            class="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs overflow-auto">{error.message}

{error.stack}</pre>
        </details>
      {/if}

      <Button onclick={retry} variant="primary">
        <RefreshCw class="h-4 w-4 mr-2" />
        Refresh Page
      </Button>
    </div>
  {/if}
{:else if children}
  {@render children()}
{/if}
