<script lang="ts">
  import type { ComponentType, Snippet } from "svelte";
  import { Icon, Inbox } from "lucide-svelte";
  import Button from "./Button.svelte";

  interface Props {
    title: string;
    description?: string;
    icon?: ComponentType;
    actionText?: string;
    onAction?: () => void;
    children?: Snippet;
    class?: string;
  }

  let {
    title,
    description,
    icon = Inbox,
    actionText,
    onAction,
    children,
    class: className = "",
  }: Props = $props();
</script>

<!--
 * EmptyState Component - Svelte 5 Runes
 * Empty state placeholder with optional action or custom children
 -->

<div
  class="flex flex-col items-center justify-center py-12 px-4 text-center {className}"
>
  <Icon this={icon} class="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />

  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
    {title}
  </h3>

  {#if description}
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
      {description}
    </p>
  {/if}

  {#if children}
    <div class="mt-4">
      {@render children()}
    </div>
  {:else if actionText && onAction}
    <Button onclick={onAction}>
      {actionText}
    </Button>
  {/if}
</div>
