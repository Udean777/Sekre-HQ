<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';

	interface Props {
		isOpen: boolean;
		title?: string;
		children: Snippet;
		onClose: () => void;
	}

	let { isOpen = $bindable(false), title, children, onClose }: Props = $props();

	let dialogElement: HTMLDialogElement;

	$effect(() => {
		if (isOpen && dialogElement) {
			dialogElement.showModal();
		} else if (!isOpen && dialogElement) {
			dialogElement.close();
		}
	});

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === dialogElement) {
			onClose();
		}
	}

	function handleEscape(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}
</script>

<dialog
	bind:this={dialogElement}
	class="rounded-lg shadow-xl backdrop:bg-gray-500 backdrop:bg-opacity-75 p-0 max-w-lg w-full"
	onclick={handleBackdropClick}
	onkeydown={handleEscape}
>
	<div class="bg-white rounded-lg overflow-hidden">
		{#if title}
			<div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
				<h3 class="text-lg font-medium text-gray-900">{title}</h3>
				<button
					type="button"
					class="text-gray-400 hover:text-gray-500 focus:outline-none"
					onclick={onClose}
				>
					<span class="sr-only">Close</span>
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>
		{/if}
		<div class="px-6 py-4">
			{@render children()}
		</div>
	</div>
</dialog>

<style>
	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
	}
</style>
