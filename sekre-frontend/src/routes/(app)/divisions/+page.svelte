<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { divisionService } from '$lib/features/divisions/services';
	import { divisionsStore } from '$lib/features/divisions/stores';
	import type { Division } from '$lib/features/divisions/types';

	let divisions = $state<Division[]>([]);
	let isLoading = $state(true);
	let error = $state('');
	let showCreateModal = $state(false);
	let createForm = $state({ name: '', description: '' });
	let isCreating = $state(false);

	onMount(async () => {
		await loadDivisions();
	});

	async function loadDivisions() {
		isLoading = true;
		error = '';
		try {
			divisions = await divisionService.list();
			divisionsStore.set(divisions);
		} catch (err: any) {
			error = err.message || 'Failed to load divisions';
		} finally {
			isLoading = false;
		}
	}

	async function handleCreate() {
		if (!createForm.name.trim()) {
			error = 'Division name required';
			return;
		}

		isCreating = true;
		error = '';

		try {
			const newDivision = await divisionService.create(createForm);
			divisionsStore.add(newDivision);
			divisions = [newDivision, ...divisions];
			showCreateModal = false;
			createForm = { name: '', description: '' };
		} catch (err: any) {
			error = err.message || 'Failed to create division';
		} finally {
			isCreating = false;
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Delete this division? This cannot be undone.')) return;

		try {
			await divisionService.delete(id);
			divisionsStore.remove(id);
			divisions = divisions.filter((d) => d.id !== id);
		} catch (err: any) {
			error = err.message || 'Failed to delete division';
		}
	}

	const canCreateMore = $derived((divisions?.length || 0) < 7);
</script>

<svelte:head>
	<title>Divisions - Sekre</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">Divisions</h1>
			<p class="mt-2 text-gray-600">Manage your organization divisions</p>
		</div>
		<button
			onclick={() => (showCreateModal = true)}
			disabled={!canCreateMore}
			class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			Create Division
		</button>
	</div>

	{#if !canCreateMore}
		<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
			<p class="text-sm text-yellow-800">
				Maximum 7 divisions reached for FREE plan. Upgrade to create more.
			</p>
		</div>
	{/if}

	{#if error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4">
			<p class="text-sm text-red-800">{error}</p>
		</div>
	{/if}

	{#if isLoading}
		<div class="text-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
			<p class="mt-4 text-gray-600">Loading divisions...</p>
		</div>
	{:else if divisions.length === 0}
		<div class="text-center py-12 bg-white rounded-lg shadow">
			<svg
				class="mx-auto h-12 w-12 text-gray-400"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
				/>
			</svg>
			<h3 class="mt-2 text-sm font-medium text-gray-900">No divisions</h3>
			<p class="mt-1 text-sm text-gray-500">Get started by creating a new division.</p>
			<div class="mt-6">
				<button
					onclick={() => (showCreateModal = true)}
					class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
				>
					Create Division
				</button>
			</div>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each divisions as division}
				<div class="bg-white rounded-lg shadow hover:shadow-md transition p-6">
					<div class="flex justify-between items-start">
						<div class="flex-1">
							<h3 class="text-lg font-semibold text-gray-900">{division.name}</h3>
							{#if division.description}
								<p class="mt-1 text-sm text-gray-600">{division.description}</p>
							{/if}
						</div>
						<button
							onclick={() => handleDelete(division.id)}
							class="text-red-600 hover:text-red-800"
							title="Delete division"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
								/>
							</svg>
						</button>
					</div>
					<div class="mt-4 flex items-center justify-between">
						<span class="text-sm text-gray-500">
							Created {new Date(division.created_at).toLocaleDateString()}
						</span>
						<a
							href="/divisions/{division.id}"
							class="text-sm text-blue-600 hover:text-blue-800 font-medium"
						>
							View Details →
						</a>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Create Modal -->
{#if showCreateModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
			<div class="p-6">
				<h2 class="text-xl font-bold text-gray-900 mb-4">Create Division</h2>

				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleCreate();
					}}
				>
					<div class="space-y-4">
						<div>
							<label for="name" class="block text-sm font-medium text-gray-700">
								Division Name *
							</label>
							<input
								id="name"
								type="text"
								required
								bind:value={createForm.name}
								class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
								placeholder="e.g., Engineering"
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
