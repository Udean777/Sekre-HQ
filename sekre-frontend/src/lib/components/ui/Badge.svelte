<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
		children: Snippet;
	}

	let { variant = 'default', children }: Props = $props();

	const variantClasses = {
		default: 'bg-gray-100 text-gray-800',
		success: 'bg-green-100 text-green-800',
		warning: 'bg-yellow-100 text-yellow-800',
		danger: 'bg-red-100 text-red-800',
		info: 'bg-blue-100 text-blue-800'
	};

	// Use $derived for reactive classes
	const classes = $derived(
		`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`
	);
</script>

<span class={classes}>
	{@render children()}
</span>
