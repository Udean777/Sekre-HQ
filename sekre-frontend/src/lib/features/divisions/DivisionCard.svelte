<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Division } from '$lib/api/types';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { formatDate } from '$lib/utils/format';

	interface Props {
		division: Division;
	}

	let { division }: Props = $props();

	let isDeleting = $state(false);
	let showDeleteConfirm = $state(false);

	function confirmDelete() {
		showDeleteConfirm = true;
	}

	function cancelDelete() {
		showDeleteConfirm = false;
	}
</script>

<Card>
	<div class="space-y-4">
		<div class="flex items-start justify-between">
			<div>
				<h3 class="text-lg font-medium text-gray-900">{division.name}</h3>
				<p class="mt-1 text-sm text-gray-500">
					Created {formatDate(division.created_at)}
				</p>
			</div>
			<div class="flex space-x-2">
				<a href="/app/divisions/{division.id}">
					<Button variant="secondary" size="sm">
						<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
							/>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
							/>
						</svg>
					</Button>
				</a>
				<Button variant="danger" size="sm" onclick={confirmDelete}>
					<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</Button>
			</div>
		</div>

		{#if showDeleteConfirm}
			<div class="border-t border-gray-200 pt-4">
				<p class="text-sm text-gray-700 mb-3">
					Are you sure you want to delete this division? This action cannot be undone.
				</p>
				<form
					method="POST"
					action="?/delete"
					use:enhance={() => {
						isDeleting = true;
						return async ({ update }) => {
							await update();
							isDeleting = false;
						};
					}}
				>
					<input type="hidden" name="id" value={division.id} />
					<div class="flex space-x-3">
						<Button type="button" variant="secondary" size="sm" onclick={cancelDelete}>
							Cancel
						</Button>
						<Button type="submit" variant="danger" size="sm" loading={isDeleting}>
							Delete Division
						</Button>
					</div>
				</form>
			</div>
		{/if}
	</div>
</Card>
