<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title?: string;
		children: Snippet;
	}

	let { title, children }: Props = $props();
</script>

<div class="bg-white shadow rounded-lg overflow-hidden">
	{#if title}
		<div class="px-4 py-5 sm:px-6 border-b border-gray-200">
			<h3 class="text-lg font-medium leading-6 text-gray-900">{title}</h3>
		</div>
	{/if}
	<div class="px-4 py-5 sm:p-6">
		{@render children()}
	</div>
</div>
