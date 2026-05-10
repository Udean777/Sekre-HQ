<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { divisionService } from '$lib/features/divisions/services';
	import { currentDivision } from '$lib/features/divisions/stores';
	import { authStore } from '$lib/features/auth/stores';
	import type { DivisionWithMembers, DivisionMember } from '$lib/features/divisions/types';

	let division = $state<DivisionWithMembers | null>(null);
	let isLoading = $state(true);
	let error = $state('');
	let showEditModal = $state(false);
	let editForm = $state({ name: '', description: '' });
	let isEditing = $state(false);

	const divisionId = $derived($page.params.id);

	onMount(async () => {
		await loadDivision();
	});

	async function loadDivision() {
		if (!divisionId) return;

		isLoading = true;
		error = '';
		try {
			division = await divisionService.getById(divisionId);
			currentDivision.set(division);
		} catch (err: any) {
			error = err.message || 'Failed to load division';
		} finally {
			isLoading = false;
		}
	}

	function openEditModal() {
		if (!division) return;
		editForm = {
			name: division.division.name,
			description: division.division.description || ''
		};
		showEditModal = true;
	}

	async function handleUpdate() {
		if (!division || !editForm.name.trim() || !divisionId) return;

		isEditing = true;
		error = '';

		try {
			const updated = await divisionService.update(divisionId, editForm);
			division.division = updated;
			showEditModal = false;
		} catch (err: any) {
			error = err.message || 'Failed to update division';
		} finally {
			isEditing = false;
		}
	}

	async function handleDelete() {
		if (!divisionId || !confirm('Delete this division? This cannot be undone.')) return;

		try {
			await divisionService.delete(divisionId);
			goto('/divisions');
		} catch (err: any) {
			error = err.message || 'Failed to delete division';
		}
	}

	async function handleRemoveMember(userId: string) {
		if (!divisionId || !confirm('Remove this member from division?')) return;

		try {
			await divisionService.removeMember(divisionId, userId);
			await loadDivision();
		} catch (err: any) {
			error = err.message || 'Failed to remove member';
		}
	}

	async function handleChangeRole(userId: string, currentRole: string) {
		if (!divisionId) return;
		const newRole = currentRole === 'HEAD' ? 'STAFF' : 'HEAD';
		if (!confirm(`Change role to ${newRole}?`)) return;

		try {
			await divisionService.updateMemberRole(divisionId, userId, newRole);
			await loadDivision();
		} catch (err: any) {
			error = err.message || 'Failed to update role';
		}
	}

	const memberCount = $derived(division?.members.length || 0);
	const canAddMore = $derived(memberCount < 15);
</script>

<svelte:head>
	<title>{division?.division.name || 'Division'} - Sekre</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<a href="/divisions" class="text-gray-600 hover:text-gray-900"> ← Back to Divisions </a>
	</div>

	{#if error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4">
			<p class="text-sm text-red-800">{error}</p>
		</div>
	{/if}

	{#if isLoading}
		<div class="text-center py-12">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
			<p class="mt-4 text-gray-600">Loading division...</p>
		</div>
	{:else if division}
		<!-- Division Info -->
		<div class="bg-white rounded-lg shadow p-6">
			<div class="flex justify-between items-start">
				<div class="flex-1">
					<h1 class="text-3xl font-bold text-gray-900">{division.division.name}</h1>
					{#if division.division.description}
						<p class="mt-2 text-gray-600">{division.division.description}</p>
					{/if}
					<p class="mt-4 text-sm text-gray-500">
						Created {new Date(division.division.created_at).toLocaleDateString()}
					</p>
				</div>
				<div class="flex gap-2">
					<button
						onclick={openEditModal}
						class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
					>
						Edit
					</button>
					<button
						onclick={handleDelete}
						class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
					>
						Delete
					</button>
				</div>
			</div>
		</div>

		<!-- Members Section -->
		<div class="bg-white rounded-lg shadow">
			<div class="p-6 border-b">
				<div class="flex justify-between items-center">
					<div>
						<h2 class="text-xl font-bold text-gray-900">Members</h2>
						<p class="text-sm text-gray-600 mt-1">
							{memberCount} / 15 members
						</p>
					</div>
					<button
						disabled={!canAddMore}
						class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Add Member
					</button>
				</div>
			</div>

			{#if !canAddMore}
				<div class="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
					<p class="text-sm text-yellow-800">Maximum 15 members reached for this division.</p>
				</div>
			{/if}

			<div class="p-6">
				{#if !division.members || division.members.length === 0}
					<div class="text-center py-8">
						<p class="text-gray-500">No members yet</p>
					</div>
				{:else}
					<div class="space-y-4">
						{#each division.members as member}
							<div class="flex items-center justify-between p-4 border rounded-lg">
								<div class="flex items-center gap-4">
									<div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
										<span class="text-blue-600 font-semibold">
											{member.user.full_name.charAt(0).toUpperCase()}
										</span>
									</div>
									<div>
										<p class="font-medium text-gray-900">{member.user.full_name}</p>
										<p class="text-sm text-gray-500">{member.user.email}</p>
									</div>
								</div>
								<div class="flex items-center gap-3">
									<button
										onclick={() => handleChangeRole(member.user.id, member.division_role)}
										class="px-3 py-1 text-sm rounded-full {member.division_role === 'HEAD'
											? 'bg-purple-100 text-purple-800'
											: 'bg-gray-100 text-gray-800'}"
									>
										{member.division_role}
									</button>
									<button
										onclick={() => handleRemoveMember(member.user.id)}
										class="text-red-600 hover:text-red-800"
										title="Remove member"
									>
										<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<!-- Edit Modal -->
{#if showEditModal && division}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
			<div class="p-6">
				<h2 class="text-xl font-bold text-gray-900 mb-4">Edit Division</h2>

				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleUpdate();
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
								bind:value={editForm.name}
								class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						<div>
							<label for="description" class="block text-sm font-medium text-gray-700">
								Description
							</label>
							<textarea
								id="description"
								bind:value={editForm.description}
								rows="3"
								class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
							></textarea>
						</div>
					</div>

					<div class="mt-6 flex gap-3">
						<button
							type="button"
							onclick={() => (showEditModal = false)}
							class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isEditing}
							class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
						>
							{isEditing ? 'Saving...' : 'Save'}
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
{/if}
