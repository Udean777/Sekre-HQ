<script lang="ts">
  /**
   * EventCard Component
   * Displays a single event in card format
   * Following SvelteKit 5 best practices with runes
   */
  import { toEventViewModel } from "$lib/services/event.service";
  import type { Event } from "$lib/api/types/event.types";

  interface Props {
    event: Event;
    onclick?: () => void;
  }

  let { event, onclick }: Props = $props();

  // Transform to view model with computed properties
  const viewModel = $derived(toEventViewModel(event));
</script>

<button
  type="button"
  class="w-full text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  {onclick}
>
  <!-- Status badge -->
  <div class="flex items-start justify-between mb-2">
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      class:bg-blue-100={viewModel.statusColor === "blue"}
      class:text-blue-800={viewModel.statusColor === "blue"}
      class:dark:bg-blue-900={viewModel.statusColor === "blue"}
      class:dark:text-blue-200={viewModel.statusColor === "blue"}
      class:bg-green-100={viewModel.statusColor === "green"}
      class:text-green-800={viewModel.statusColor === "green"}
      class:dark:bg-green-900={viewModel.statusColor === "green"}
      class:dark:text-green-200={viewModel.statusColor === "green"}
      class:bg-gray-100={viewModel.statusColor === "gray"}
      class:text-gray-800={viewModel.statusColor === "gray"}
      class:dark:bg-gray-700={viewModel.statusColor === "gray"}
      class:dark:text-gray-200={viewModel.statusColor === "gray"}
    >
      {viewModel.statusLabel}
    </span>
  </div>

  <!-- Title -->
  <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
    {event.title}
  </h3>

  <!-- Description -->
  {#if event.description}
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
      {event.description}
    </p>
  {/if}

  <!-- Event details -->
  <div class="space-y-2 text-xs text-gray-500 dark:text-gray-400">
    <!-- Date -->
    <div class="flex items-center gap-1">
      <svg
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <span>{viewModel.formattedDate}</span>
    </div>

    <!-- Time -->
    <div class="flex items-center gap-1">
      <svg
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{viewModel.formattedTime}</span>
      <span class="text-gray-400 dark:text-gray-500">({viewModel.duration})</span>
    </div>

    <!-- Location -->
    {#if event.location}
      <div class="flex items-center gap-1">
        <svg
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span class="truncate">{event.location}</span>
      </div>
    {/if}
  </div>
</button>
