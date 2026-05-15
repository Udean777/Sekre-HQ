<script lang="ts">
  import { Badge } from "$lib/components/ui";
  import { Calendar } from "lucide-svelte";
  import type { Event } from "$lib/api/types/event.types";

  interface Props {
    event: Event;
  }

  let { event }: Props = $props();

  function formatEventDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  const startDate = $derived(formatEventDate(event.start_time));
</script>

<!--
 * RecentEventItem Component - Svelte 5 Runes
 * Displays a recent event item
 -->

<a
  href="/app/events"
  class="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
>
  <div class="flex items-start gap-3">
    <div class="shrink-0 mt-1">
      <Calendar class="w-5 h-5 text-purple-600 dark:text-purple-400" />
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
        {event.title}
      </p>
      {#if event.description}
        <p class="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
          {event.description}
        </p>
      {/if}
      <div class="flex items-center gap-2 mt-2">
        <span class="text-xs text-gray-500 dark:text-gray-400">
          {startDate}
        </span>
        {#if event.location}
          <Badge color="blue">
            {event.location}
          </Badge>
        {/if}
      </div>
    </div>
  </div>
</a>
