<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authService } from '$lib/features/auth/services';

	onMount(() => {
		const token = authService.getAccessToken();
		if (token) {
			goto('/dashboard', { replaceState: true });
		} else {
			goto('/register', { replaceState: true });
		}
	});
</script>

<div class="min-h-screen flex items-center justify-center">
	<div class="text-center">
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
		<p class="mt-4 text-gray-600">Loading...</p>
	</div>
</div>
