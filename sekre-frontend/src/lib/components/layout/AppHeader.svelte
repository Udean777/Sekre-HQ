<script lang="ts">
  import { Menu, Search, Sun, Moon } from "lucide-svelte";
  import { themeStore } from "$lib/stores";
  import UserMenu from "./UserMenu.svelte";
  import Breadcrumbs from "./Breadcrumbs.svelte";
  import type { User, Organization } from "$lib/api/types";

  interface Props {
    onMenuClick?: () => void;
    user?: User;
    organization?: Organization;
  }

  let { onMenuClick, user, organization }: Props = $props();

  let searchQuery = $state("");

  function toggleTheme() {
    themeStore.toggle();
  }

  function handleSearch(e: Event) {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Search:", searchQuery);
  }
</script>

<header
  class="h-16 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 flex items-center px-4 lg:px-6"
>
  <!-- Mobile menu button -->
  <button
    type="button"
    class="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors mr-2"
    onclick={onMenuClick}
    aria-label="Open menu"
  >
    <Menu class="h-6 w-6" />
  </button>

  <!-- Breadcrumbs (desktop only) -->
  <div class="hidden lg:block">
    <Breadcrumbs />
  </div>

  <!-- Spacer -->
  <div class="flex-1"></div>

  <!-- Search bar -->
  <form onsubmit={handleSearch} class="hidden md:block mr-4">
    <div class="relative">
      <Search
        class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500"
      />
      <input
        type="search"
        bind:value={searchQuery}
        placeholder="Search..."
        class="w-64 pl-10 pr-4 py-2 text-sm bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
      />
    </div>
  </form>

  <!-- Theme toggle -->
  <button
    type="button"
    onclick={toggleTheme}
    class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors mr-2"
    aria-label="Toggle theme"
  >
    {#if themeStore.activeTheme === "dark"}
      <Sun class="h-5 w-5" />
    {:else}
      <Moon class="h-5 w-5" />
    {/if}
  </button>

  <!-- User menu -->
  {#if user}
    <UserMenu {user} {organization} />
  {/if}
</header>
