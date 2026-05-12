<script lang="ts">
  /**
   * Tasks Page
   * Main page for task management
   * Following SvelteKit 5 best practices with runes
   */
  import type { PageData, ActionData } from "./$types";
  import Button from "$lib/components/ui/Button.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import EmptyState from "$lib/components/ui/EmptyState.svelte";
  import Alert from "$lib/components/ui/Alert.svelte";
  import TaskCard from "$lib/features/tasks/TaskCard.svelte";
  import TaskForm from "$lib/features/tasks/TaskForm.svelte";
  import {
    groupTasksByStatus,
    sortTasksByDueDate,
  } from "$lib/services/task.service";
  import { enhance } from "$app/forms";
  import type { TaskWithAssignee } from "$lib/api/types/task.types";

  interface Props {
    data: PageData;
    form?: ActionData;
  }

  let { data, form }: Props = $props();

  // Modal state
  let isCreateModalOpen = $state(false);
  let isEditModalOpen = $state(false);
  let selectedTask = $state<TaskWithAssignee | null>(null);
  let isSubmitting = $state(false);

  // Filter state
  let selectedDivision = $derived(data.filters.division_id || "");
  let selectedStatus = $derived(data.filters.status || "");

  // Group tasks by status
  const groupedTasks = $derived(groupTasksByStatus(data.tasks));

  function openCreateModal() {
    isCreateModalOpen = true;
  }

  function closeCreateModal() {
    isCreateModalOpen = false;
  }

  function openEditModal(task: TaskWithAssignee) {
    selectedTask = task;
    isEditModalOpen = true;
  }

  function closeEditModal() {
    isEditModalOpen = false;
    selectedTask = null;
  }

  function applyFilters() {
    const params = new URLSearchParams();
    if (selectedDivision) params.set("division_id", selectedDivision);
    if (selectedStatus) params.set("status", selectedStatus);

    const query = params.toString();
    window.location.href = `/app/tasks${query ? "?" + query : ""}`;
  }

  function clearFilters() {
    selectedDivision = "";
    selectedStatus = "";
    window.location.href = "/app/tasks";
  }
</script>

<svelte:head>
  <title>Tasks - Sekre</title>
</svelte:head>

<div class="space-y-6">
	<!-- Debug Info -->
	<div class="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm">
		<p><strong>Debug Info:</strong></p>
		<p>Tasks loaded: {data.tasks?.length || 0}</p>
		<p>Divisions loaded: {data.divisions?.length || 0}</p>
		<p>Has error: {data.error ? 'Yes' : 'No'}</p>
		<p>Form error: {form?.error ? 'Yes' : 'No'}</p>
		{#if selectedDivision || selectedStatus}
			<p class="text-orange-600 font-semibold mt-2">
				⚠️ Filters active! Division: {selectedDivision || 'All'}, Status: {selectedStatus || 'All'}
			</p>
		{/if}
	</div>

	<!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Tasks</h1>
      <p class="mt-1 text-sm text-gray-500">
        Manage and track your team's tasks
      </p>
    </div>
    <Button variant="primary" onclick={openCreateModal}>
      <svg
        class="h-5 w-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4v16m8-8H4"
        />
      </svg>
      New Task
    </Button>
  </div>

  <!-- Error message from form action -->
  {#if form?.error}
    <Alert variant="error" message={form.error} dismissible />
  {/if}

  <!-- Error message from page load -->
  {#if data.error}
    <Alert variant="error" message={data.error} dismissible />
  {/if}

  <!-- Filters -->
  <div class="bg-white border border-gray-200 rounded-lg p-4">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Division filter -->
      <div>
        <label
          for="division-filter"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Division
        </label>
        <select
          id="division-filter"
          bind:value={selectedDivision}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Divisions</option>
          {#each data.divisions as division}
            <option value={division.id}>{division.name}</option>
          {/each}
        </select>
      </div>

      <!-- Status filter -->
      <div>
        <label
          for="status-filter"
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          Status
        </label>
        <select
          id="status-filter"
          bind:value={selectedStatus}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      </div>

      <!-- Filter actions -->
      <div class="flex items-end gap-2">
        <div class="flex-1">
          <Button variant="primary" onclick={applyFilters}>Apply</Button>
        </div>
        <Button variant="secondary" onclick={clearFilters}>Clear</Button>
      </div>
    </div>
  </div>

  <!-- Tasks by status -->
  {#if data.tasks.length > 0}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- TODO Column -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">To Do</h2>
          <span class="text-sm text-gray-500">{groupedTasks.TODO.length}</span>
        </div>
        <div class="space-y-3">
          {#each sortTasksByDueDate(groupedTasks.TODO) as task (task.task.id)}
            <TaskCard {task} onclick={() => openEditModal(task)} />
          {/each}
          {#if groupedTasks.TODO.length === 0}
            <p class="text-sm text-gray-500 text-center py-8">No tasks</p>
          {/if}
        </div>
      </div>

      <!-- IN_PROGRESS Column -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">In Progress</h2>
          <span class="text-sm text-gray-500"
            >{groupedTasks.IN_PROGRESS.length}</span
          >
        </div>
        <div class="space-y-3">
          {#each sortTasksByDueDate(groupedTasks.IN_PROGRESS) as task (task.task.id)}
            <TaskCard {task} onclick={() => openEditModal(task)} />
          {/each}
          {#if groupedTasks.IN_PROGRESS.length === 0}
            <p class="text-sm text-gray-500 text-center py-8">No tasks</p>
          {/if}
        </div>
      </div>

      <!-- DONE Column -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Done</h2>
          <span class="text-sm text-gray-500">{groupedTasks.DONE.length}</span>
        </div>
        <div class="space-y-3">
          {#each sortTasksByDueDate(groupedTasks.DONE) as task (task.task.id)}
            <TaskCard {task} onclick={() => openEditModal(task)} />
          {/each}
          {#if groupedTasks.DONE.length === 0}
            <p class="text-sm text-gray-500 text-center py-8">No tasks</p>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <EmptyState
      title="No tasks yet"
      description="Get started by creating your first task to track your work."
    >
      {#snippet action()}
        <Button variant="primary" onclick={openCreateModal}>Create Task</Button>
      {/snippet}
    </EmptyState>
  {/if}
</div>

<!-- Create Task Modal -->
<Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} title="Create New Task">
	<form
		method="POST"
		action="?/create"
		onsubmit={(e) => {
			// Validate before submit
			const formData = new FormData(e.currentTarget);
			const title = formData.get('title') as string;
			const division_id = formData.get('division_id') as string;
			
			if (!title?.trim() || !division_id) {
				e.preventDefault();
				return;
			}
		}}
		use:enhance={() => {
			isSubmitting = true;
			return async ({ result, update }) => {
				isSubmitting = false;
				
				if (result.type === 'success') {
					closeCreateModal();
					await update();
				} else if (result.type === 'failure') {
					await update();
				}
			};
		}}
	>
		<TaskForm divisions={data.divisions} oncancel={closeCreateModal} loading={isSubmitting} />
	</form>
</Modal>

<!-- Edit Task Modal -->
{#if selectedTask}
	<Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Task">
		<form
			method="POST"
			action="?/update"
			onsubmit={(e) => {
				// Validate before submit
				const formData = new FormData(e.currentTarget);
				const title = formData.get('title') as string;
				
				if (!title?.trim()) {
					e.preventDefault();
					return;
				}
			}}
			use:enhance={() => {
				isSubmitting = true;
				return async ({ result, update }) => {
					isSubmitting = false;
					
					if (result.type === 'success') {
						closeEditModal();
						await update();
					} else if (result.type === 'failure') {
						await update();
					}
				};
			}}
		>
			<input type="hidden" name="task_id" value={selectedTask.task.id} />
			<TaskForm
				task={selectedTask}
				divisions={data.divisions}
				oncancel={closeEditModal}
				loading={isSubmitting}
			/>
		</form>

		<!-- Delete button -->
		<form
			method="POST"
			action="?/delete"
			use:enhance={() => {
				return async ({ result, update }) => {
					if (result.type === 'success') {
						closeEditModal();
						await update();
					} else if (result.type === 'failure') {
						await update();
					}
				};
			}}
			class="mt-4 pt-4 border-t border-gray-200"
		>
			<input type="hidden" name="task_id" value={selectedTask.task.id} />
			<Button
				type="submit"
				variant="danger"
				onclick={() => {
					if (!confirm('Are you sure you want to delete this task?')) {
						return false;
					}
				}}
			>
				Delete Task
			</Button>
		</form>
	</Modal>
{/if}
