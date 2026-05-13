<script lang="ts">
	/**
	 * Toast Notification Component
	 * Shows temporary success/error/info messages
	 */
	import { onMount } from 'svelte';

	interface Props {
		message: string;
		type?: 'success' | 'error' | 'info' | 'warning';
		duration?: number;
		onClose?: () => void;
	}

	let { message, type = 'info', duration = 5000, onClose }: Props = $props();

	let isVisible = $state(true);

	onMount(() => {
		const timer = setTimeout(() => {
			isVisible = false;
			if (onClose) {
				setTimeout(onClose, 300); // Wait for fade out animation
			}
		}, duration);

		return () => clearTimeout(timer);
	});

	function handleClose() {
		isVisible = false;
		if (onClose) {
			setTimeout(onClose, 300);
		}
	}

	const typeStyles = {
		success: 'bg-green-50 border-green-200 text-green-800',
		error: 'bg-red-50 border-red-200 text-red-800',
		warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
		info: 'bg-blue-50 border-blue-200 text-blue-800'
	};

	const iconPaths = {
		success:
			'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
		error:
			'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
		warning:
			'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
		info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
	};
</script>

{#if isVisible}
	<div
		class="fixed top-4 right-4 z-50 max-w-md w-full transform transition-all duration-300 ease-in-out {isVisible
			? 'translate-x-0 opacity-100'
			: 'translate-x-full opacity-0'}"
	>
		<div class="rounded-lg border-2 shadow-lg p-4 {typeStyles[type]}">
			<div class="flex items-start">
				<div class="shrink-0">
					<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d={iconPaths[type]}
						/>
					</svg>
				</div>
				<div class="ml-3 flex-1">
					<p class="text-sm font-medium">{message}</p>
				</div>
				<button
					type="button"
					onclick={handleClose}
					class="ml-3 shrink-0 hover:opacity-70 transition-opacity"
					aria-label="Close notification"
				>
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
	</div>
{/if}
