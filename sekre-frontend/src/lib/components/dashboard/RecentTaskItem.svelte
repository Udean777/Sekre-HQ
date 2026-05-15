<script lang="ts">
  import { Badge } from "$lib/components/ui";
  import type { TaskWithAssignee } from "$lib/api/types/task.types";

  interface Props {
    task: TaskWithAssignee;
  }

  let { task }: Props = $props();

  const statusColors = {
    TODO: "gray",
    IN_PROGRESS: "blue",
    DONE: "green",
  } as const;

  const statusLabels = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    DONE: "Done",
  } as const;
</script>

<!--
 * RecentTaskItem Component - Svelte 5 Runes
 * Displays a recent task item
 -->

<a
  href="/app/tasks"
  class="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
>
  <div class="flex items-start justify-between">
    <div class="flex-1 min-w-0">
      <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
        {task.task.title}
      </p>
      {#if task.task.description}
        <p class="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
          {task.task.description}
        </p>
      {/if}
      <div class="flex items-center gap-2 mt-2">
        <Badge color={statusColors[task.task.status]}>
          {statusLabels[task.task.status]}
        </Badge>
        {#if task.assignee}
          <span class="text-xs text-gray-500 dark:text-gray-400">
            Assigned to {task.assignee.full_name}
          </span>
        {/if}
      </div>
    </div>
  </div>
</a>
