<script lang="ts">
  import { enhance, applyAction } from "$app/forms";
  import type { ActionData } from "./$types";
  import { Button, Card } from "$lib/components/ui";
  import { FormField, FormError } from "$lib/components/forms";
  import { validateEmail, validateRequired } from "$lib/utils/validation";
  import { LogIn } from "lucide-svelte";

  interface Props {
    form?: ActionData;
  }

  let { form }: Props = $props();

  let isLoading = $state(false);
  let email = $state("");
  let password = $state("");
  let errors = $state<Record<string, string>>({});

  // Initialize email from form data
  $effect(() => {
    if (form?.email) {
      email = form.email;
    }
  });

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error || "Invalid email";
    }

    const passwordValidation = validateRequired(password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.error || "Password is required";
    }

    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: SubmitEvent) {
    console.log('[Form Submit] Client values:', { email, password: password ? '***' : '(empty)' });
    
    if (!validateForm()) {
      e.preventDefault();
      return;
    }
    isLoading = true;
  }
</script>

<svelte:head>
  <title>Login - Sekre</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    <div class="text-center">
      <div class="flex justify-center mb-4">
        <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
          <LogIn class="w-6 h-6 text-white" />
        </div>
      </div>
      <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">
        Sign in to your organization
      </h2>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Or
        <a href="/register" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
          create a new organization
        </a>
      </p>
    </div>

    <Card class="p-8">
      <form
        method="POST"
        class="space-y-6"
        onsubmit={handleSubmit}
        use:enhance={({ formData }) => {
          // Manually set form data from state to ensure it's sent
          formData.set('email', email);
          formData.set('password', password);
          
          return async ({ result }) => {
            console.log('[Form Enhance] Result type:', result.type);
            
            // Always apply the action result
            // This handles redirect, failure, and success properly
            await applyAction(result);
            
            // Only reset loading for non-redirect results
            // For redirects, the page will navigate away
            if (result.type === 'failure' || result.type === 'error') {
              isLoading = false;
            }
          };
        }}
      >
        {#if form?.error}
          <FormError message={form.error} />
        {/if}

        <FormField label="Email address" id="email" required error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            bind:value={email}
            disabled={isLoading}
            required
            class="block w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600"
            class:border-red-300={errors.email}
            class:focus:border-red-500={errors.email}
            class:focus:ring-red-500={errors.email}
          />
        </FormField>

        <FormField label="Password" id="password" required error={errors.password}>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            placeholder="••••••••"
            bind:value={password}
            disabled={isLoading}
            required
            class="block w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600"
            class:border-red-300={errors.password}
            class:focus:border-red-500={errors.password}
            class:focus:ring-red-500={errors.password}
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Card>
  </div>
</div>
