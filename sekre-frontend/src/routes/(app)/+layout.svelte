<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, isAuthenticated } from '$lib/features/auth/stores';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	let isLoading = $state(true);

	onMount(() => {
		authStore.init().then(() => {
			isLoading = false;
		});

		// Redirect to login if not authenticated
		const unsubscribe = isAuthenticated.subscribe((value) => {
			if (!isLoading && !value) {
				goto('/login');
			}
		});

		return unsubscribe;
	});

	function handleLogout() {
		authStore.logout();
		goto('/login');
	}
</script>

{#if isLoading}
	<div class="min-h-screen flex items-center justify-center">
		<div class="text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
			<p class="mt-4 text-gray-600">Loading...</p>
		</div>
	</div>
{:else if $isAuthenticated}
	<div class="min-h-screen bg-gray-100">
		<!-- Sidebar -->
		<div class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
			<div class="flex flex-col h-full">
				<!-- Logo -->
				<div class="flex items-center justify-center h-16 border-b">
					<h1 class="text-xl font-bold text-blue-600">Sekre</h1>
				</div>

				<!-- Navigation -->
				<nav class="flex-1 px-4 py-6 space-y-2">
					<a
						href="/dashboard"
						class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
					>
						<span>Dashboard</span>
					</a>
					<a
						href="/tasks"
						class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
					>
						<span>Tasks</span>
					</a>
					<a
						href="/events"
						class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
					>
						<span>Events</span>
					</a>
					<a
						href="/finance"
						class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
					>
						<span>Finance</span>
					</a>
					<a
						href="/divisions"
						class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
					>
						<span>Divisions</span>
					</a>
					<a
						href="/settings"
						class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
					>
						<span>Settings</span>
					</a>
				</nav>

				<!-- User info -->
				<div class="border-t p-4">
					<div class="flex items-center justify-between">
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900 truncate">
								{$authStore.user?.full_name}
							</p>
							<p class="text-xs text-gray-500 truncate">
								{$authStore.organization?.name}
							</p>
						</div>
						<button onclick={handleLogout} class="ml-2 text-sm text-gray-500 hover:text-gray-700">
							Logout
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Main content -->
		<div class="ml-64">
			<!-- Header -->
			<header class="bg-white shadow-sm">
				<div class="px-8 py-4">
					<h2 class="text-2xl font-semibold text-gray-800">
						{$authStore.organization?.name}
					</h2>
				</div>
			</header>

			<!-- Page content -->
			<main class="p-8">
				{@render children()}
			</main>
		</div>
	</div>
{/if}
