<script lang="ts">
  import { enhance } from "$app/forms";
  import type { User } from "$lib/api/types";

  interface Props {
    user: User;
  }

  let { user }: Props = $props();

  let isOpen = $state(false);
  let isLoggingOut = $state(false);

  function toggleMenu() {
    isOpen = !isOpen;
  }

  function closeMenu() {
    isOpen = false;
  }
</script>

<div class="relative">
  <!-- User button -->
  <button
    type="button"
    class="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    onclick={toggleMenu}
  >
    <span class="sr-only">Open user menu</span>
    <div
      class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium"
    >
      {user.full_name.charAt(0).toUpperCase()}
    </div>
  </button>

  <!-- Dropdown menu -->
  {#if isOpen}
    <!-- Backdrop -->
    <button
      type="button"
      class="fixed inset-0 z-10"
      onclick={closeMenu}
      aria-label="Close menu"
      tabindex="-1"
    ></button>

    <!-- Menu -->
    <div
      class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-20"
    >
      <div class="px-4 py-2 border-b border-gray-200">
        <p class="text-sm font-medium text-gray-900">{user.full_name}</p>
        <p class="text-xs text-gray-500 truncate">{user.email}</p>
      </div>

      <form
        method="POST"
        action="/logout"
        use:enhance={() => {
          isLoggingOut = true;
          return async ({ update }) => {
            await update();
            isLoggingOut = false;
          };
        }}
      >
        <button
          type="submit"
          disabled={isLoggingOut}
          class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </form>
    </div>
  {/if}
</div>
