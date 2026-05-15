<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    padding?: "none" | "sm" | "md" | "lg";
    hover?: boolean;
    onclick?: () => void;
    children?: Snippet;
    class?: string;
    title?: string;
  }

  let {
    padding = "md",
    hover = false,
    onclick,
    children,
    class: className = "",
    title,
  }: Props = $props();

  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  const baseClasses =
    "bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700";

  const classes = $derived(
    `${baseClasses} ${hover ? "hover:shadow-md transition-shadow cursor-pointer" : ""} ${paddingClasses[padding]} ${className}`,
  );
</script>

{#if onclick}
  <button type="button" class={classes} {onclick}>
    {#if title}
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
    {/if}
    {#if children}
      {@render children()}
    {/if}
  </button>
{:else}
  <div class={classes}>
    {#if title}
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
    {/if}
    {#if children}
      {@render children()}
    {/if}
  </div>
{/if}
