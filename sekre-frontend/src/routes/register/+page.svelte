<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";
  import { Button, Input, Card } from "$lib/components/ui";
  import { FormField, FormError } from "$lib/components/forms";
  import {
    validateEmail,
    validateRequired,
    validateMinLength,
    validatePattern,
  } from "$lib/utils/validation";
  import { Building2 } from "lucide-svelte";

  interface Props {
    form?: ActionData;
  }

  let { form }: Props = $props();

  let isLoading = $state(false);
  let organizationName = $state("");
  let subdomain = $state("");
  let fullName = $state("");
  let email = $state("");
  let password = $state("");
  let errors = $state<Record<string, string>>({});

  // Initialize form fields from form data
  $effect(() => {
    if (form?.organization_name) organizationName = form.organization_name;
    if (form?.subdomain) subdomain = form.subdomain;
    if (form?.full_name) fullName = form.full_name;
    if (form?.email) email = form.email;
  });

  const subdomainPattern = /^[a-z0-9-]+$/;

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    const orgNameValidation = validateRequired(organizationName);
    if (!orgNameValidation.valid) {
      newErrors.organization_name =
        orgNameValidation.error || "Organization name is required";
    }

    const subdomainRequiredValidation = validateRequired(subdomain);
    if (!subdomainRequiredValidation.valid) {
      newErrors.subdomain =
        subdomainRequiredValidation.error || "Subdomain is required";
    } else {
      const subdomainPatternValidation = validatePattern(
        subdomain,
        subdomainPattern,
        "Subdomain can only contain lowercase letters, numbers, and hyphens",
      );
      if (!subdomainPatternValidation.valid) {
        newErrors.subdomain =
          subdomainPatternValidation.error || "Invalid subdomain format";
      }
    }

    const fullNameValidation = validateRequired(fullName);
    if (!fullNameValidation.valid) {
      newErrors.full_name = fullNameValidation.error || "Full name is required";
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.error || "Invalid email";
    }

    const passwordRequiredValidation = validateRequired(password);
    if (!passwordRequiredValidation.valid) {
      newErrors.password =
        passwordRequiredValidation.error || "Password is required";
    } else {
      const passwordLengthValidation = validateMinLength(password, 8);
      if (!passwordLengthValidation.valid) {
        newErrors.password =
          passwordLengthValidation.error ||
          "Password must be at least 8 characters";
      }
    }

    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validateForm()) {
      return false;
    }
    isLoading = true;
  }
</script>

<svelte:head>
  <title>Register - Sekre</title>
</svelte:head>

<div
  class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
>
  <div class="max-w-md w-full space-y-8">
    <div class="text-center">
      <div class="flex justify-center mb-4">
        <div
          class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center"
        >
          <Building2 class="w-6 h-6 text-white" />
        </div>
      </div>
      <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white">
        Create your organization
      </h2>
      <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Already have an account?
        <a
          href="/login"
          class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          Sign in
        </a>
      </p>
    </div>

    <Card class="p-8">
      <form
        method="POST"
        class="space-y-6"
        onsubmit={handleSubmit}
        use:enhance={() => {
          return async ({ update }) => {
            await update();
            isLoading = false;
          };
        }}
      >
        {#if form?.error}
          <FormError message={form.error} />
        {/if}

        <FormField
          label="Organization Name"
          id="organization_name"
          required
          error={errors.organization_name}
        >
          <Input
            id="organization_name"
            name="organization_name"
            type="text"
            placeholder="HIMTI UNPAB"
            bind:value={organizationName}
            error={errors.organization_name}
            disabled={isLoading}
          />
        </FormField>

        <FormField
          label="Subdomain"
          id="subdomain"
          required
          error={errors.subdomain}
          hint="Only lowercase letters, numbers, and hyphens"
        >
          <div class="flex rounded-md shadow-sm">
            <Input
              id="subdomain"
              name="subdomain"
              type="text"
              placeholder="himti"
              bind:value={subdomain}
              error={errors.subdomain}
              disabled={isLoading}
              class="rounded-r-none"
            />
            <span
              class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-sm"
            >
              .sekre.app
            </span>
          </div>
        </FormField>

        <FormField
          label="Your Full Name"
          id="full_name"
          required
          error={errors.full_name}
        >
          <Input
            id="full_name"
            name="full_name"
            type="text"
            placeholder="Sajudin Ma'ruf"
            bind:value={fullName}
            error={errors.full_name}
            disabled={isLoading}
          />
        </FormField>

        <FormField
          label="Email address"
          id="email"
          required
          error={errors.email}
        >
          <Input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            bind:value={email}
            error={errors.email}
            disabled={isLoading}
          />
        </FormField>

        <FormField
          label="Password"
          id="password"
          required
          error={errors.password}
          hint="Minimum 8 characters"
        >
          <Input
            id="password"
            name="password"
            type="password"
            autocomplete="new-password"
            placeholder="••••••••"
            bind:value={password}
            error={errors.password}
            disabled={isLoading}
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
          {isLoading ? "Creating organization..." : "Create organization"}
        </Button>
      </form>
    </Card>
  </div>
</div>
