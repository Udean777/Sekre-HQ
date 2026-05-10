<script lang="ts">
	import { goto } from '$app/navigation';
	import { authService } from '$lib/features/auth/services';
	import { authStore } from '$lib/features/auth/stores';
	import type { LoginRequest } from '$lib/features/auth/types';

	let formData = $state<LoginRequest>({
		email: '',
		password: ''
	});

	let isLoading = $state(false);
	let error = $state('');

	async function handleSubmit() {
		error = '';

		if (!formData.email || !formData.password) {
			error = 'Email and password are required';
			return;
		}

		isLoading = true;

		try {
			const response = await authService.login(formData);
			authService.saveTokens(response.tokens);
			authStore.setAuth(response.user, response.organization, response.role);
			goto('/dashboard');
		} catch (err: any) {
			error = err.message || 'Login failed';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Login - Sekre</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
				Sign in to your account
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Don't have an account?
				<a href="/register" class="font-medium text-blue-600 hover:text-blue-500">
					Create one now
				</a>
			</p>
		</div>

		<form
			class="mt-8 space-y-6"
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
		>
			{#if error}
				<div class="rounded-md bg-red-50 p-4">
					<p class="text-sm text-red-800">{error}</p>
				</div>
			{/if}

			<div class="rounded-md shadow-sm space-y-4">
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700"> Email Address </label>
					<input
						id="email"
						name="email"
						type="email"
						required
						bind:value={formData.email}
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
						placeholder="john@example.com"
					/>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700"> Password </label>
					<input
						id="password"
						name="password"
						type="password"
						required
						bind:value={formData.password}
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
						placeholder="••••••••"
					/>
				</div>
			</div>

			<div>
				<button
					type="submit"
					disabled={isLoading}
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if isLoading}
						<span>Signing in...</span>
					{:else}
						<span>Sign In</span>
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
