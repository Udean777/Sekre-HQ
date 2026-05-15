/**
 * ErrorView Component - Svelte 5 Runes
 * Error display with retry action
 */

<script lang="ts">
	import { AlertCircle } from 'lucide-svelte';
	import Button from './Button.svelte';

	interface Props {
		message: string;
		onRetry?: () => void;
		class?: string;
	}

	let { message, onRetry, class: className = '' }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-12 px-4 text-center {className}">
	<AlertCircle class="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
	
	<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
		Something went wrong
	</h3>
	
	<p class="text-sm text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
		{message}
	</p>

	{#if onRetry}
		<Button onclick={onRetry} variant="outline">
			Try again
		</Button>
	{/if}
</div>
