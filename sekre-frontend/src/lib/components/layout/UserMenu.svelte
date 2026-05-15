<script lang="ts">
  import { User, Settings, LogOut, ChevronDown } from "lucide-svelte";
  import { goto } from "$app/navigation";
  import type { User as UserType, Organization } from "$lib/api/types";

  interface Props {
    user?: UserType;
    organization?: Organization;
  }

  let { user, organization }: Props = $props();

  let isOpen = $state(false);

  // Get user initials
  const userInitials = $derived(() => {
    if (!user?.full_name) return "?";
    const names = user.full_name.split(" ");
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  });

  function toggleMenu() {
    isOpen = !isOpen;
  }

  function closeMenu() {
    isOpen = false;
  }

  async function handleLogout() {
    if (confirm("Are you sure you want to logout?")) {
      // Submit logout form
      const form = document.getElementById("logout-form") as HTMLFormElement;
      if (form) {
        form.submit();
      }
    }
    closeMenu();
  }

  // Close on click outside
  $effect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-user-menu]")) {
        closeMenu();
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  });

  // Close on ESC
  $effect(() => {
    if (!isOpen) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  });
</script>

<!-- Hidden logout form -->
<form
  id="logout-form"
  method="POST"
  action="/logout"
  style="display: none;"
></form>

<div class="relative" data-user-menu>
  <!-- Trigger button -->
  <button
    type="button"
    onclick={toggleMenu}
    class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    aria-expanded={isOpen}
    aria-haspopup="true"
  >
    <!-- Avatar with initials -->
    <div
      class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium"
    >
      {userInitials()}
    </div>

    <!-- User info (desktop only) -->
    {#if user}
      <div class="hidden md:block text-left">
        <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
          {user.full_name}
        </p>
        {#if organization}
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {organization.name}
          </p>
        {/if}
      </div>
    {/if}

    <ChevronDown
      class="h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform {isOpen
        ? 'rotate-180'
        : ''}"
    />
  </button>

  <!-- Dropdown menu -->
  {#if isOpen}
    <div
      class="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
    >
      <!-- User info (mobile) -->
      {#if user}
        <div
          class="md:hidden px-4 py-3 border-b border-gray-200 dark:border-gray-700"
        >
          <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
            {user.full_name}
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {user.email}
          </p>
          {#if organization}
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {organization.name}
            </p>
          {/if}
        </div>
      {/if}

      <!-- Menu items -->
      <a
        href="/app/settings/profile"
        onclick={closeMenu}
        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <User class="h-4 w-4" />
        Profile
      </a>

      <a
        href="/app/settings"
        onclick={closeMenu}
        class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Settings class="h-4 w-4" />
        Settings
      </a>

      <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>

      <button
        type="button"
        onclick={handleLogout}
        class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <LogOut class="h-4 w-4" />
        Logout
      </button>
    </div>
  {/if}
</div>
