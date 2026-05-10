<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authService } from '$lib/features/auth/services';
	import { authStore } from '$lib/features/auth/stores';
	import type { RegisterRequest } from '$lib/features/auth/types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Loader2 } from 'lucide-svelte';

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

	onMount(() => {
		const token = authService.getAccessToken();
		if (token) {
			goto('/dashboard', { replaceState: true });
		}
	});

	async function handleSubmit() {
		error = '';

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

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
	<div class="w-full max-w-md">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-bold text-gray-900 mb-2">Sekre</h1>
			<p class="text-gray-600">Organization Management System</p>
		</div>

		<Card>
			<CardHeader>
				<CardTitle class="text-2xl">Create your organization</CardTitle>
				<CardDescription>
					Already have an account?
					<a href="/login" class="font-medium text-primary hover:underline">
						Sign in
					</a>
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
						<Label for="organization_name">Organization Name</Label>
						<Input
							id="organization_name"
							name="organization_name"
							type="text"
							required
							bind:value={formData.organization_name}
							placeholder="e.g., HIMTI UNPAB"
							disabled={isLoading}
						/>
					</div>

					<div class="space-y-2">
						<Label for="subdomain">Subdomain</Label>
						<div class="flex">
							<Input
								id="subdomain"
								name="subdomain"
								type="text"
								required
								bind:value={formData.subdomain}
								placeholder="himti"
								class="rounded-r-none"
								disabled={isLoading}
							/>
							<span class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground text-sm">
								.sekre.app
							</span>
						</div>
						<p class="text-xs text-muted-foreground">Only lowercase letters, numbers, and hyphens</p>
					</div>

					<div class="space-y-2">
						<Label for="full_name">Full Name</Label>
						<Input
							id="full_name"
							name="full_name"
							type="text"
							required
							bind:value={formData.full_name}
							placeholder="John Doe"
							disabled={isLoading}
						/>
					</div>

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
						<p class="text-xs text-muted-foreground">Minimum 8 characters</p>
					</div>

					<div class="space-y-2">
						<Label for="confirm_password">Confirm Password</Label>
						<Input
							id="confirm_password"
							name="confirm_password"
							type="password"
							required
							bind:value={confirmPassword}
							placeholder="••••••••"
							disabled={isLoading}
						/>
					</div>

					<Button type="submit" class="w-full" disabled={isLoading}>
						{#if isLoading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Creating account...
						{:else}
							Create Account
						{/if}
					</Button>
				</form>
			</CardContent>
		</Card>

		<p class="mt-4 text-center text-sm text-gray-600">
			By creating an account, you agree to our
			<a href="#" class="font-medium text-primary hover:underline">Terms of Service</a>
			and
			<a href="#" class="font-medium text-primary hover:underline">Privacy Policy</a>
		</p>
	</div>
</div>
