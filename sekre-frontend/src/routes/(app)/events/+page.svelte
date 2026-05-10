<script lang="ts">
	import { onMount } from 'svelte';
	import { eventService } from '$lib/features/events/services';
	import { divisionService } from '$lib/features/divisions/services';
	import type { Event } from '$lib/features/events/types';
	import type { Division } from '$lib/features/divisions/types';

	let events = $state<Event[]>([]);
	let divisions = $state<Division[]>([]);
	let selectedDivision = $state<string>('');
	let currentMonth = $state(new Date());
	let showCreateModal = $state(false);
	let error = $state('');

	let formData = $state({
		division_id: '',
		title: '',
		description: '',
		start_time: '',
		end_time: '',
		location: ''
	});

	onMount(async () => {
		await loadDivisions();
		await loadEvents();
	});

	async function loadDivisions() {
		try {
			divisions = await divisionService.list();
		} catch (err: any) {
			error = err.message;
		}
	}

	async function loadEvents() {
		try {
			const filters = selectedDivision ? { division_id: selectedDivision } : {};
			events = await eventService.list(filters);
		} catch (err: any) {
			error = err.message;
		}
	}

	async function handleCreate() {
		try {
			error = '';
			const newEvent = await eventService.create(formData);
			events = [newEvent, ...events];
			showCreateModal = false;
			resetForm();
		} catch (err: any) {
			error = err.message;
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Delete this event?')) return;
		try {
			await eventService.delete(id);
			events = events.filter((e) => e.id !== id);
		} catch (err: any) {
			error = err.message;
		}
	}

	function resetForm() {
		formData = {
			division_id: '',
			title: '',
			description: '',
			start_time: '',
			end_time: '',
			location: ''
		};
	}

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getDivisionName(divId: string) {
		return divisions.find((d) => d.id === divId)?.name || 'Unknown';
	}
</script>

<svelte:head>
	<title>Events - Sekre</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold text-gray-900">Events</h1>
		<button
			onclick={() => (showCreateModal = true)}
			class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
		>
			+ Create Event
		</button>
	</div>

	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
			{error}
		</div>
	{/if}

	<!-- Filter -->
	<div class="bg-white rounded-lg shadow p-4">
		<label class="block text-sm font-medium text-gray-700 mb-2">Filter by Division</label>
		<select
			bind:value={selectedDivision}
			onchange={loadEvents}
			class="w-full px-3 py-2 border border-gray-300 rounded-lg"
		>
			<option value="">All Divisions</option>
			{#each divisions as division}
				<option value={division.id}>{division.name}</option>
			{/each}
		</select>
	</div>

	<!-- Events List -->
	<div class="bg-white rounded-lg shadow">
		<div class="p-6">
			<h2 class="text-xl font-semibold mb-4">Upcoming Events</h2>
			{#if events.length === 0}
				<p class="text-gray-500 text-center py-8">No events scheduled</p>
			{:else}
				<div class="space-y-4">
					{#each events as event}
						<div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
							<div class="flex items-start justify-between">
								<div class="flex-1">
									<h3 class="font-semibold text-lg">{event.title}</h3>
									<p class="text-sm text-gray-600 mt-1">{event.description}</p>
									<div class="mt-2 space-y-1 text-sm text-gray-500">
										<p>📅 {formatDate(event.start_time)} - {formatDate(event.end_time)}</p>
										{#if event.location}
											<p>📍 {event.location}</p>
										{/if}
										<p>🏢 {getDivisionName(event.division_id)}</p>
									</div>
								</div>
								<button
									onclick={() => handleDelete(event.id)}
									class="text-red-600 hover:text-red-800 text-sm"
								>
									Delete
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Create Modal -->
{#if showCreateModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg p-6 w-full max-w-md">
			<h2 class="text-xl font-bold mb-4">Create Event</h2>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleCreate();
				}}
				class="space-y-4"
			>
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Division</label>
					<select
						bind:value={formData.division_id}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg"
					>
						<option value="">Select division</option>
						{#each divisions as division}
							<option value={division.id}>{division.name}</option>
						{/each}
					</select>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
					<input
						type="text"
						bind:value={formData.title}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
					<textarea
						bind:value={formData.description}
						rows="3"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg"
					></textarea>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
					<input
						type="datetime-local"
						bind:value={formData.start_time}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">End Time</label>
					<input
						type="datetime-local"
						bind:value={formData.end_time}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
					<input
						type="text"
						bind:value={formData.location}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg"
					/>
				</div>

				<div class="flex gap-2 pt-4">
					<button
						type="submit"
						class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
					>
						Create
					</button>
					<button
						type="button"
						onclick={() => {
							showCreateModal = false;
							resetForm();
						}}
						class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
