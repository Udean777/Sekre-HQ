<script lang="ts">
  import type { ComponentType } from "svelte";

  interface Props {
    title: string;
    description: string;
    href: string;
    icon: ComponentType;
  }

  let { title, description, href, icon: Icon }: Props = $props();
</script>

<!--
 * QuickActionCard Component - Svelte 5 Runes
 * Displays a quick action card
 -->

<a
  {href}
  class="relative rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-md focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 transition-all"
>
  <div class="shrink-0">
    <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
      <Icon class="w-5 h-5 text-blue-600 dark:text-blue-400" />
    </div>
  </div>
  <div class="flex-1 min-w-0">
    <span class="absolute inset-0" aria-hidden="true"></span>
    <p class="text-sm font-medium text-gray-900 dark:text-white">
      {title}
    </p>
    <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
      {description}
    </p>
  </div>
</a>
