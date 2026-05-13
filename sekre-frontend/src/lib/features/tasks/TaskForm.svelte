<script lang="ts">
  /**
   * TaskForm Component
   * Form for creating and editing tasks
   * Following SvelteKit 5 best practices with runes
   */
  import Button from "$lib/components/ui/Button.svelte";
  import { validateTaskForm } from "$lib/services/task.service";
  import type { TaskWithAssignee, TaskStatus } from "$lib/api/types/task.types";
  import type { Division } from "$lib/api/types";

  interface Props {
    task?: TaskWithAssignee;
    divisions: Division[];
    users?: Array<{ id: string; full_name: string }>;
    oncancel: () => void;
    loading?: boolean;
  }

  let {
    task,
    divisions,
    users = [],
    oncancel,
    loading = false,
  }: Props = $props();

  // Form state
  let formData = $derived({
    title: task?.task.title || "",
    description: task?.task.description || "",
    division_id: task?.task.division_id || "",
    assignee_id: task?.task.assignee_id || "",
    due_date: task?.task.due_date
      ? new Date(task.task.due_date).toISOString().split("T")[0]
      : "",
    status: (task?.task.status || "TODO") as TaskStatus,
  });

  let errors = $state<Record<string, string>>({});

  const isEditMode = $derived(!!task);
</script>

<div class="space-y-4">
  <!-- Title -->
  <div>
    <label for="title" class="block text-sm font-medium text-gray-700 mb-1">
      Title <span class="text-red-500">*</span>
    </label>
    <input
      type="text"
      id="title"
      name="title"
      bind:value={formData.title}
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      class:border-red-500={errors.title}
      placeholder="Enter task title"
      maxlength="500"
      required
    />
    {#if errors.title}
      <p class="mt-1 text-sm text-red-600">{errors.title}</p>
    {/if}
  </div>

  <!-- Description -->
  <div>
    <label
      for="description"
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      Description
    </label>
    <textarea
      id="description"
      name="description"
      bind:value={formData.description}
      rows="3"
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Enter task description"
    ></textarea>
  </div>

  <!-- Division -->
  <div>
    <label
      for="division_id"
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      Division <span class="text-red-500">*</span>
    </label>
    <select
      id="division_id"
      name="division_id"
      bind:value={formData.division_id}
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      class:border-red-500={errors.division_id}
      disabled={isEditMode}
      required
    >
      <option value="">Select division</option>
      {#each divisions as division}
        <option value={division.id}>{division.name}</option>
      {/each}
    </select>
    {#if errors.division_id}
      <p class="mt-1 text-sm text-red-600">{errors.division_id}</p>
    {/if}
  </div>

  <!-- Assignee -->
  {#if users.length > 0}
    <div>
      <label
        for="assignee_id"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        Assignee
      </label>
      <select
        id="assignee_id"
        name="assignee_id"
        bind:value={formData.assignee_id}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Unassigned</option>
        {#each users as user}
          <option value={user.id}>{user.full_name}</option>
        {/each}
      </select>
    </div>
  {/if}

  <!-- Due Date -->
  <div>
    <label for="due_date" class="block text-sm font-medium text-gray-700 mb-1">
      Due Date
    </label>
    <input
      type="date"
      id="due_date"
      name="due_date"
      bind:value={formData.due_date}
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  <!-- Status (only in edit mode) -->
  {#if isEditMode}
    <div>
      <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
        Status
      </label>
      <select
        id="status"
        name="status"
        bind:value={formData.status}
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="TODO">To Do</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="DONE">Done</option>
      </select>
    </div>
  {/if}

  <!-- Actions -->
  <div class="flex justify-end gap-3 pt-4">
    <Button
      type="button"
      variant="secondary"
      onclick={oncancel}
      disabled={loading}
    >
      Cancel
    </Button>
    <Button type="submit" variant="primary" disabled={loading}>
      {loading ? "Saving..." : isEditMode ? "Update Task" : "Create Task"}
    </Button>
  </div>
</div>
