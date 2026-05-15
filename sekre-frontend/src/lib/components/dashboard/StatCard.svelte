<script lang="ts">
  import type { ComponentType } from "svelte";
  import { Folder, CheckSquare, Calendar, DollarSign } from "lucide-svelte";

  interface Props {
    title: string;
    value: string | number;
    type: "divisions" | "tasks" | "events" | "finance";
    href?: string;
  }

  let { title, value, type, href }: Props = $props();

  const iconMap: Record<string, ComponentType> = {
    divisions: Folder,
    tasks: CheckSquare,
    events: Calendar,
    finance: DollarSign,
  };

  const colorMap: Record<string, { bg: string; text: string }> = {
    divisions: {
      bg: "bg-blue-100 dark:bg-blue-900",
      text: "text-blue-600 dark:text-blue-400",
    },
    tasks: {
      bg: "bg-green-100 dark:bg-green-900",
      text: "text-green-600 dark:text-green-400",
    },
    events: {
      bg: "bg-purple-100 dark:bg-purple-900",
      text: "text-purple-600 dark:text-purple-400",
    },
    finance: {
      bg: "bg-yellow-100 dark:bg-yellow-900",
      text: "text-yellow-600 dark:text-yellow-400",
    },
  };

  const Icon = $derived(iconMap[type]);
  const colors = $derived(colorMap[type]);
</script>

<!--
 * StatCard Component - Svelte 5 Runes
 * Displays a statistic card with Lucide icon
 -->

{#if href}
  <a
    {href}
    class="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all"
  >
    <div class="flex items-center">
      <div class="shrink-0 p-3 rounded-full {colors.bg}">
        <Icon class="w-6 h-6 {colors.text}" />
      </div>
      <div class="ml-5 w-0 flex-1">
        <dl>
          <dt
            class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate"
          >
            {title}
          </dt>
          <dd class="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </dd>
        </dl>
      </div>
    </div>
  </a>
{:else}
  <div
    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6"
  >
    <div class="flex items-center">
      <div class="shrink-0 p-3 rounded-full {colors.bg}">
        <Icon class="w-6 h-6 {colors.text}" />
      </div>
      <div class="ml-5 w-0 flex-1">
        <dl>
          <dt
            class="text-sm font-medium text-gray-500 dark:text-gray-400 truncate"
          >
            {title}
          </dt>
          <dd class="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </dd>
        </dl>
      </div>
    </div>
  </div>
{/if}
