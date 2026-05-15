<script lang="ts">
  /**
   * Tasks Page
   * Main page for task management
   * Following SvelteKit 5 best practices with runes
   */
  import type { PageData, ActionData } from "./$types";
  import Button from "$lib/components/ui/Button.svelte";
  import Card from "$lib/components/ui/Card.svelte";
  import Select from "$lib/components/ui/Select.svelte";
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
  let selectedDivision = $state("");
  let selectedStatus = $state("");

  $effect(() => {
    selectedDivision = (data as any).filters?.division_id || "";
    selectedStatus = (data as any).filters?.status || "";
  });

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
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
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
  <Card padding="md">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Division filter -->
      <Select
        id="division-filter"
        name="division-filter"
        label="Division"
        bind:value={selectedDivision}
        options={[
          { value: "", label: "All Divisions" },
          ...data.divisions.map((division) => ({
            value: division.id,
            label: division.name,
          })),
        ]}
      />

      <!-- Status filter -->
      <Select
        id="status-filter"
        name="status-filter"
        label="Status"
        bind:value={selectedStatus}
        options={[
          { value: "", label: "All Statuses" },
          { value: "TODO", label: "To Do" },
          { value: "IN_PROGRESS", label: "In Progress" },
          { value: "DONE", label: "Done" },
        ]}
      />

      <!-- Filter actions -->
      <div class="flex items-end gap-2">
        <div class="flex-1">
          <Button variant="primary" onclick={applyFilters}>Apply</Button>
        </div>
        <Button variant="secondary" onclick={clearFilters}>Clear</Button>
      </div>
    </div>
  </Card>

  <!-- Tasks by status -->
  {#if data.tasks.length > 0}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- TODO Column -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            To Do
          </h2>
          <span class="text-sm text-gray-500 dark:text-gray-400"
            >{groupedTasks.TODO.length}</span
          >
        </div>
        <div class="space-y-3">
          {#each sortTasksByDueDate(groupedTasks.TODO) as task (task.task.id)}
            <TaskCard {task} onclick={() => openEditModal(task)} />
          {/each}
          {#if groupedTasks.TODO.length === 0}
            <p
              class="text-sm text-gray-500 dark:text-gray-400 text-center py-8"
            >
              No tasks
            </p>
          {/if}
        </div>
      </div>

      <!-- IN_PROGRESS Column -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            In Progress
          </h2>
          <span class="text-sm text-gray-500 dark:text-gray-400"
            >{groupedTasks.IN_PROGRESS.length}</span
          >
        </div>
        <div class="space-y-3">
          {#each sortTasksByDueDate(groupedTasks.IN_PROGRESS) as task (task.task.id)}
            <TaskCard {task} onclick={() => openEditModal(task)} />
          {/each}
          {#if groupedTasks.IN_PROGRESS.length === 0}
            <p
              class="text-sm text-gray-500 dark:text-gray-400 text-center py-8"
            >
              No tasks
            </p>
          {/if}
        </div>
      </div>

      <!-- DONE Column -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Done
          </h2>
          <span class="text-sm text-gray-500 dark:text-gray-400"
            >{groupedTasks.DONE.length}</span
          >
        </div>
        <div class="space-y-3">
          {#each sortTasksByDueDate(groupedTasks.DONE) as task (task.task.id)}
            <TaskCard {task} onclick={() => openEditModal(task)} />
          {/each}
          {#if groupedTasks.DONE.length === 0}
            <p
              class="text-sm text-gray-500 dark:text-gray-400 text-center py-8"
            >
              No tasks
            </p>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <EmptyState
      title="No tasks yet"
      description="Get started by creating your first task to track your work."
    >
      <Button variant="primary" onclick={openCreateModal}>Create Task</Button>
    </EmptyState>
  {/if}
</div>

<!-- Create Task Modal -->
<Modal
  isOpen={isCreateModalOpen}
  onClose={closeCreateModal}
  title="Create New Task"
>
  <form
    method="POST"
    action="?/create"
    onsubmit={(e) => {
      // Validate before submit
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      const division_id = formData.get("division_id") as string;

      if (!title?.trim() || !division_id) {
        e.preventDefault();
        return;
      }
    }}
    use:enhance={() => {
      isSubmitting = true;
      return async ({ result, update }) => {
        isSubmitting = false;

        if (result.type === "success") {
          closeCreateModal();
          await update();
        } else if (result.type === "failure") {
          await update();
        }
      };
    }}
  >
    <TaskForm
      divisions={data.divisions}
      oncancel={closeCreateModal}
      loading={isSubmitting}
    />
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
        const title = formData.get("title") as string;

        if (!title?.trim()) {
          e.preventDefault();
          return;
        }
      }}
      use:enhance={() => {
        isSubmitting = true;
        return async ({ result, update }) => {
          isSubmitting = false;

          if (result.type === "success") {
            closeEditModal();
            await update();
          } else if (result.type === "failure") {
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
          if (result.type === "success") {
            closeEditModal();
            await update();
          } else if (result.type === "failure") {
            await update();
          }
        };
      }}
      class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
    >
      <input type="hidden" name="task_id" value={selectedTask.task.id} />
      <Button
        type="submit"
        variant="danger"
        onclick={() => {
          if (!confirm("Are you sure you want to delete this task?")) {
            return false;
          }
        }}
      >
        Delete Task
      </Button>
    </form>
  </Modal>
{/if}
