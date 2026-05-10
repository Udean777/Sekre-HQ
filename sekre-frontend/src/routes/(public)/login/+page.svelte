<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authService } from '$lib/features/auth/services';
	import { authStore } from '$lib/features/auth/stores';
	import type { LoginRequest } from '$lib/features/auth/types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Loader2 } from 'lucide-svelte';

	let formData = $state<LoginRequest>({
		email: '',
		password: ''
	});

	let isLoading = $state(false);
	let error = $state('');

	onMount(() => {
		const token = authService.getAccessToken();
		if (token) {
			goto('/dashboard', { replaceState: true });
		}
	});

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

<div
	class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8"
>
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-gray-900 mb-2">Sekre</h1>
			<p class="text-gray-600">Organization Management System</p>
		</div>

		<Card>
			<CardHeader>
				<CardTitle class="text-2xl">Sign in to your account</CardTitle>
				<CardDescription>
					Don't have an account?
					<a href="/register" class="font-medium text-primary hover:underline"> Create one now </a>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					class="space-y-4"
					onsubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
				>
					{#if error}
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					{/if}

					<div class="space-y-2">
						<Label for="email">Email Address</Label>
						<Input
							id="email"
							name="email"
							type="email"
							required
							bind:value={formData.email}
							placeholder="john@example.com"
							disabled={isLoading}
						/>
					</div>

					<div class="space-y-2">
						<Label for="password">Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							required
							bind:value={formData.password}
							placeholder="••••••••"
							disabled={isLoading}
						/>
					</div>

					<Button type="submit" class="w-full" disabled={isLoading}>
						{#if isLoading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Signing in...
						{:else}
							Sign In
						{/if}
					</Button>
				</form>
			</CardContent>
		</Card>

		<p class="mt-4 text-center text-sm text-gray-600">
			By signing in, you agree to our
			<a href="#" class="font-medium text-primary hover:underline">Terms of Service</a>
			and
			<a href="#" class="font-medium text-primary hover:underline">Privacy Policy</a>
		</p>
	</div>
</div>
