<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    color?: "gray" | "blue" | "green" | "yellow" | "red" | "purple";
    size?: "sm" | "md" | "lg";
    children?: Snippet;
    class?: string;
  }

  let {
    color = "gray",
    size = "md",
    children,
    class: className = "",
  }: Props = $props();

  const colorClasses = {
    gray: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    yellow:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    purple:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base",
  };

  const classes = $derived(
    `inline-flex items-center font-medium rounded-full ${colorClasses[color]} ${sizeClasses[size]} ${className}`,
  );
</script>

<span class={classes}>
  {#if children}
    {@render children()}
  {/if}
</span>
