<script lang="ts">
	import { onMount } from 'svelte';
	import { taskService } from '$lib/features/tasks/services';
	import { tasksStore } from '$lib/features/tasks/stores';
	import { divisionsStore } from '$lib/features/divisions/stores';
	import { divisionService } from '$lib/features/divisions/services';
	import type { TaskWithAssignee, CreateTaskRequest } from '$lib/features/tasks/types';
	import type { Division } from '$lib/features/divisions/types';

	let tasks = $state<TaskWithAssignee[]>([]);
	let divisions = $state<Division[]>([]);
	let isLoading = $state(true);
	let error = $state('');
	let showCreateModal = $state(false);
	let createForm = $state<CreateTaskRequest>({
		division_id: '',
		title: '',
		description: ''
	});
	let isCreating = $state(false);

	const todoTasks = $derived(tasks.filter((t) => t.task.status === 'TODO'));
	const inProgressTasks = $derived(tasks.filter((t) => t.task.status === 'IN_PROGRESS'));
	const doneTasks = $derived(tasks.filter((t) => t.task.status === 'DONE'));

	onMount(async () => {
		await Promise.all([loadTasks(), loadDivisions()]);
	});

	async function loadTasks() {
		isLoading = true;
		error = '';
		try {
			tasks = await taskService.list();
			tasksStore.set(tasks);
		} catch (err: any) {
			error = err.message || 'Failed to load tasks';
		} finally {
			isLoading = false;
		}
	}

	async function loadDivisions() {
		try {
			divisions = await divisionService.list();
			divisionsStore.set(divisions);
			if (divisions.length > 0 && !createForm.division_id) {
				createForm.division_id = divisions[0].id;
			}
		} catch (err: any) {
			console.error('Failed to load divisions:', err);
		}
	}

	async function handleCreate() {
		if (!createForm.title.trim() || !createForm.division_id) {
			error = 'Title and division required';
			return;
		}

		isCreating = true;
		error = '';

		try {
			const newTask = await taskService.create(createForm);
			tasksStore.add(newTask);
			tasks = [newTask, ...tasks];
			showCreateModal = false;
			createForm = { division_id: divisions[0]?.id || '', title: '', description: '' };
		} catch (err: any) {
			error = err.message || 'Failed to create task';
		} finally {
			isCreating = false;
		}
	}

	async function handleStatusChange(taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') {
		try {
			await taskService.updateStatus(taskId, newStatus);
			tasksStore.updateStatus(taskId, newStatus);
			tasks = tasks.map((t) =>
				t.task.id === taskId ? { ...t, task: { ...t.task, status: newStatus } } : t
			);
		} catch (err: any) {
			error = err.message || 'Failed to update status';
		}
	}

	async function handleDelete(taskId: string) {
		if (!confirm('Delete this task?')) return;

		try {
			await taskService.delete(taskId);
			tasksStore.remove(taskId);
			tasks = tasks.filter((t) => t.task.id !== taskId);
		} catch (err: any) {
			error = err.message || 'Failed to delete task';
		}
	}
</script>

<svelte:head>
	<title>Tasks - Sekre</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Tasks</h1>
			<p class="mt-2 text-gray-600">Manage your tasks with Kanban board</p>
		</div>
		<button
			onclick={() => (showCreateModal = true)}
			class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
		>
			Create Task
		</button>
	</div>

	{#if error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4">
			<p class="text-sm text-red-800">{error}</p>
		</div>
	{/if}

	{#if isLoading}
		<div class="text-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
			<p class="mt-4 text-gray-600">Loading tasks...</p>
		</div>
	{:else}
		<!-- Kanban Board -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<!-- TODO Column -->
			<div class="bg-gray-50 rounded-lg p-4">
				<div class="flex items-center justify-between mb-4">
					<h2 class="font-semibold text-gray-900">To Do</h2>
					<span class="px-2 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
						{todoTasks.length}
					</span>
				</div>
				<div class="space-y-3">
					{#each todoTasks as task}
						<div class="bg-white rounded-lg shadow p-4">
							<h3 class="font-medium text-gray-900">{task.task.title}</h3>
							{#if task.task.description}
								<p class="text-sm text-gray-600 mt-1">{task.task.description}</p>
							{/if}
							{#if task.assignee}
								<p class="text-xs text-gray-500 mt-2">
									Assigned to: {task.assignee.full_name}
								</p>
							{/if}
							<div class="flex gap-2 mt-3">
								<button
									onclick={() => handleStatusChange(task.task.id, 'IN_PROGRESS')}
									class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
								>
									Start
								</button>
								<button
									onclick={() => handleDelete(task.task.id)}
									class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
								>
									Delete
								</button>
							</div>
						</div>
					{/each}
					{#if todoTasks.length === 0}
						<p class="text-sm text-gray-500 text-center py-8">No tasks</p>
					{/if}
				</div>
			</div>

			<!-- IN_PROGRESS Column -->
			<div class="bg-blue-50 rounded-lg p-4">
				<div class="flex items-center justify-between mb-4">
					<h2 class="font-semibold text-gray-900">In Progress</h2>
					<span class="px-2 py-1 bg-blue-200 text-blue-700 text-sm rounded-full">
						{inProgressTasks.length}
					</span>
				</div>
				<div class="space-y-3">
					{#each inProgressTasks as task}
						<div class="bg-white rounded-lg shadow p-4">
							<h3 class="font-medium text-gray-900">{task.task.title}</h3>
							{#if task.task.description}
								<p class="text-sm text-gray-600 mt-1">{task.task.description}</p>
							{/if}
							{#if task.assignee}
								<p class="text-xs text-gray-500 mt-2">
									Assigned to: {task.assignee.full_name}
								</p>
							{/if}
							<div class="flex gap-2 mt-3">
								<button
									onclick={() => handleStatusChange(task.task.id, 'TODO')}
									class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
								>
									Back
								</button>
								<button
									onclick={() => handleStatusChange(task.task.id, 'DONE')}
									class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
								>
									Done
								</button>
								<button
									onclick={() => handleDelete(task.task.id)}
									class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
								>
									Delete
								</button>
							</div>
						</div>
					{/each}
					{#if inProgressTasks.length === 0}
						<p class="text-sm text-gray-500 text-center py-8">No tasks</p>
					{/if}
				</div>
			</div>

			<!-- DONE Column -->
			<div class="bg-green-50 rounded-lg p-4">
				<div class="flex items-center justify-between mb-4">
					<h2 class="font-semibold text-gray-900">Done</h2>
					<span class="px-2 py-1 bg-green-200 text-green-700 text-sm rounded-full">
						{doneTasks.length}
					</span>
				</div>
				<div class="space-y-3">
					{#each doneTasks as task}
						<div class="bg-white rounded-lg shadow p-4 opacity-75">
							<h3 class="font-medium text-gray-900 line-through">{task.task.title}</h3>
							{#if task.task.description}
								<p class="text-sm text-gray-600 mt-1">{task.task.description}</p>
							{/if}
							{#if task.assignee}
								<p class="text-xs text-gray-500 mt-2">
									Assigned to: {task.assignee.full_name}
								</p>
							{/if}
							<div class="flex gap-2 mt-3">
								<button
									onclick={() => handleStatusChange(task.task.id, 'IN_PROGRESS')}
									class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
								>
									Reopen
								</button>
								<button
									onclick={() => handleDelete(task.task.id)}
									class="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
								>
									Delete
								</button>
							</div>
						</div>
					{/each}
					{#if doneTasks.length === 0}
						<p class="text-sm text-gray-500 text-center py-8">No tasks</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Create Modal -->
{#if showCreateModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
			<div class="p-6">
				<h2 class="text-xl font-bold text-gray-900 mb-4">Create Task</h2>

				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleCreate();
					}}
				>
					<div class="space-y-4">
						<div>
							<label for="division" class="block text-sm font-medium text-gray-700">
								Division *
							</label>
							<select
								id="division"
								required
								bind:value={createForm.division_id}
								class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							>
								{#each divisions as division}
									<option value={division.id}>{division.name}</option>
								{/each}
							</select>
						</div>

						<div>
							<label for="title" class="block text-sm font-medium text-gray-700"> Title * </label>
							<input
								id="title"
								type="text"
								required
								bind:value={createForm.title}
								class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
								placeholder="Task title"
							/>
						</div>

						<div>
							<label for="description" class="block text-sm font-medium text-gray-700">
								Description
							</label>
							<textarea
								id="description"
								bind:value={createForm.description}
								rows="3"
								class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
								placeholder="Optional description"
							></textarea>
						</div>
					</div>

					<div class="mt-6 flex gap-3">
						<button
							type="button"
							onclick={() => (showCreateModal = false)}
							class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isCreating}
							class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
						>
							{isCreating ? 'Creating...' : 'Create'}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
