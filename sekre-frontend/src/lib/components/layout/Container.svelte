<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
    padding?: boolean;
    centered?: boolean;
    children?: Snippet;
    class?: string;
  }

  let {
    size = "lg",
    padding = true,
    centered = false,
    children,
    class: className = "",
  }: Props = $props();

  const sizeClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    "2xl": "max-w-screen-2xl",
    full: "max-w-full",
  };

  const classes = $derived(
    `w-full ${sizeClasses[size]} ${padding ? "px-4 sm:px-6 lg:px-8 py-6" : ""} ${centered ? "mx-auto" : ""} ${className}`,
  );
</script>

<div class={classes}>
  {#if children}
    {@render children()}
  {/if}
</div>
