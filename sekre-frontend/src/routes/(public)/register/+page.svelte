<script lang="ts">
	import { goto } from '$app/navigation';
	import { authService } from '$lib/features/auth/services';
	import { authStore } from '$lib/features/auth/stores';
	import type { RegisterRequest } from '$lib/features/auth/types';

	let formData = $state<RegisterRequest>({
		organization_name: '',
		subdomain: '',
		full_name: '',
		email: '',
		password: ''
	});

	let confirmPassword = $state('');
	let isLoading = $state(false);
	let error = $state('');

	async function handleSubmit() {
		error = '';

		// Validation
		if (
			!formData.organization_name ||
			!formData.subdomain ||
			!formData.full_name ||
			!formData.email ||
			!formData.password
		) {
			error = 'All fields are required';
			return;
		}

		if (formData.password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (formData.password.length < 8) {
			error = 'Password must be at least 8 characters';
			return;
		}

		isLoading = true;

		try {
			const response = await authService.register(formData);
			authService.saveTokens(response.tokens);
			authStore.setAuth(response.user, response.organization, response.role);
			goto('/dashboard');
		} catch (err: any) {
			error = err.message || 'Registration failed';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Register - Sekre</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
				Create your organization
			</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Already have an account?
				<a href="/login" class="font-medium text-blue-600 hover:text-blue-500"> Sign in </a>
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
					<label for="organization_name" class="block text-sm font-medium text-gray-700">
						Organization Name
					</label>
					<input
						id="organization_name"
						name="organization_name"
						type="text"
						required
						bind:value={formData.organization_name}
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
						placeholder="e.g., HIMTI UNPAB"
					/>
				</div>

				<div>
					<label for="subdomain" class="block text-sm font-medium text-gray-700"> Subdomain </label>
					<div class="mt-1 flex rounded-md shadow-sm">
						<input
							id="subdomain"
							name="subdomain"
							type="text"
							required
							bind:value={formData.subdomain}
							class="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
							placeholder="himti"
						/>
						<span
							class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
						>
							.sekre.app
						</span>
					</div>
					<p class="mt-1 text-xs text-gray-500">Only lowercase letters, numbers, and hyphens</p>
				</div>

				<div>
					<label for="full_name" class="block text-sm font-medium text-gray-700"> Full Name </label>
					<input
						id="full_name"
						name="full_name"
						type="text"
						required
						bind:value={formData.full_name}
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
						placeholder="John Doe"
					/>
				</div>

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

				<div>
					<label for="confirm_password" class="block text-sm font-medium text-gray-700">
						Confirm Password
					</label>
					<input
						id="confirm_password"
						name="confirm_password"
						type="password"
						required
						bind:value={confirmPassword}
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
						<span>Creating account...</span>
					{:else}
						<span>Create Account</span>
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
