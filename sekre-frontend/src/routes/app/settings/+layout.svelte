<script lang="ts">
  import type { Snippet } from "svelte";
  import { page } from "$app/stores";
  import type { LayoutData } from "./$types";

  interface Props {
    data: LayoutData;
    children: Snippet;
  }

  let { data, children }: Props = $props();

  const tabs = [
    { label: "Profile", href: "/app/settings/profile", icon: "user" },
    { label: "Security", href: "/app/settings/security", icon: "lock" },
    {
      label: "Organization",
      href: "/app/settings/organization",
      icon: "building",
    },
  ];
</script>

<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
  <div class="mb-8">
    <h1 class="text-3xl font-semibold text-gray-900 dark:text-white">
      Settings
    </h1>
    <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
      Manage your account and organization settings
    </p>
  </div>

  <div
    class="flex gap-2 border-b-2 border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto"
  >
    {#each tabs as tab}
      <a
        href={tab.href}
        class={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-[2px] transition-colors whitespace-nowrap ${
          $page.url.pathname === tab.href
            ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent"
        }`}
        aria-current={$page.url.pathname === tab.href ? "page" : undefined}
      >
        {#if tab.icon === "user"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        {:else if tab.icon === "lock"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        {:else if tab.icon === "building"}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
            <path d="M9 22v-4h6v4"></path>
            <path d="M8 6h.01"></path>
            <path d="M16 6h.01"></path>
            <path d="M12 6h.01"></path>
            <path d="M12 10h.01"></path>
            <path d="M12 14h.01"></path>
            <path d="M16 10h.01"></path>
            <path d="M16 14h.01"></path>
            <path d="M8 10h.01"></path>
            <path d="M8 14h.01"></path>
          </svg>
        {/if}
        <span>{tab.label}</span>
      </a>
    {/each}
  </div>

  <div
    class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 sm:p-8 shadow-sm"
  >
    {@render children()}
  </div>
</div>
