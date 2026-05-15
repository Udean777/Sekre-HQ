<script lang="ts">
  /**
   * TaskCard Component
   * Displays a single task in card format
   * Following SvelteKit 5 best practices with runes
   */
  import { toTaskViewModel, formatDueDate } from "$lib/services/task.service";
  import type { TaskWithAssignee } from "$lib/api/types/task.types";

  interface Props {
    task: TaskWithAssignee;
    onclick?: () => void;
  }

  let { task, onclick }: Props = $props();

  // Transform to view model with computed properties
  const viewModel = $derived(toTaskViewModel(task));
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
      class:bg-gray-100={viewModel.statusColor === "gray"}
      class:text-gray-800={viewModel.statusColor === "gray"}
      class:dark:bg-gray-700={viewModel.statusColor === "gray"}
      class:dark:text-gray-200={viewModel.statusColor === "gray"}
      class:bg-blue-100={viewModel.statusColor === "blue"}
      class:text-blue-800={viewModel.statusColor === "blue"}
      class:dark:bg-blue-900={viewModel.statusColor === "blue"}
      class:dark:text-blue-200={viewModel.statusColor === "blue"}
      class:bg-green-100={viewModel.statusColor === "green"}
      class:text-green-800={viewModel.statusColor === "green"}
      class:dark:bg-green-900={viewModel.statusColor === "green"}
      class:dark:text-green-200={viewModel.statusColor === "green"}
    >
      {viewModel.statusLabel}
    </span>

    {#if viewModel.isOverdue}
      <span
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      >
        Overdue
      </span>
    {:else if viewModel.isDueSoon}
      <span
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      >
        Due Soon
      </span>
    {/if}
  </div>

  <!-- Title -->
  <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
    {task.task.title}
  </h3>

  <!-- Description -->
  {#if task.task.description}
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
      {task.task.description}
    </p>
  {/if}

  <!-- Footer -->
  <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
    <!-- Assignee -->
    <div class="flex items-center gap-2">
      {#if task.assignee}
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span class="truncate max-w-[120px]">{task.assignee.full_name}</span>
        </div>
      {:else}
        <span class="text-gray-400 dark:text-gray-500">Unassigned</span>
      {/if}
    </div>

    <!-- Due date -->
    {#if task.task.due_date}
      <div
        class="flex items-center gap-1"
        class:text-red-600={viewModel.isOverdue}
        class:text-yellow-600={viewModel.isDueSoon}
      >
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
        <span>{formatDueDate(task.task.due_date)}</span>
      </div>
    {/if}
  </div>
</button>
