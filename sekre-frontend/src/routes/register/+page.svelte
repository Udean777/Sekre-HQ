<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";

  interface Props {
    form?: ActionData;
  }

  let { form }: Props = $props();

  let isLoading = $state(false);
</script>

<svelte:head>
  <title>Register - Sekre</title>
</svelte:head>

<div
  class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
>
  <div class="max-w-md w-full space-y-8">
    <div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Create your organization
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Already have an account?
        <a href="/login" class="font-medium text-blue-600 hover:text-blue-500">
          Sign in
        </a>
      </p>
    </div>

    <form
      method="POST"
      class="mt-8 space-y-6"
      use:enhance={() => {
        isLoading = true;
        return async ({ update }) => {
          await update();
          isLoading = false;
        };
      }}
    >
      {#if form?.error}
        <div class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {form.error}
              </h3>
            </div>
          </div>
        </div>
      {/if}

      <div class="rounded-md shadow-sm space-y-4">
        <div>
          <label
            for="organization_name"
            class="block text-sm font-medium text-gray-700"
          >
            Organization Name
          </label>
          <input
            id="organization_name"
            name="organization_name"
            type="text"
            required
            value={form?.organization_name ?? ""}
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="HIMTI UNPAB"
          />
        </div>

        <div>
          <label
            for="subdomain"
            class="block text-sm font-medium text-gray-700"
          >
            Subdomain
          </label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <input
              id="subdomain"
              name="subdomain"
              type="text"
              required
              pattern="[a-z0-9-]+"
              value={form?.subdomain ?? ""}
              class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="himti"
            />
            <span
              class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm"
            >
              .sekre.app
            </span>
          </div>
          <p class="mt-1 text-xs text-gray-500">
            Only lowercase letters, numbers, and hyphens
          </p>
        </div>

        <div>
          <label
            for="full_name"
            class="block text-sm font-medium text-gray-700"
          >
            Your Full Name
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            value={form?.full_name ?? ""}
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Sajudin Ma'ruf"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            value={form?.email ?? ""}
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="new-password"
            required
            minlength="8"
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="••••••••"
          />
          <p class="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if isLoading}
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg
                class="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
            Creating organization...
          {:else}
            Create organization
          {/if}
        </button>
      </div>
    </form>
  </div>
</div>
