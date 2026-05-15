<script lang="ts">
  import {
    X,
    Home,
    Folder,
    CheckSquare,
    Calendar,
    DollarSign,
    Users,
    Settings,
    Icon,
  } from "lucide-svelte";
  import { page } from "$app/stores";
  import type { User, Organization } from "$lib/api/types";
  import type { ComponentType } from "svelte";

  interface Props {
    isOpen: boolean;
    onClose: () => void;
    user?: User;
    organization?: Organization;
  }

  let { isOpen, onClose, user, organization }: Props = $props();

  interface NavItem {
    name: string;
    href: string;
    icon: ComponentType;
  }

  const navigation: NavItem[] = [
    { name: "Dashboard", href: "/app", icon: Home },
    { name: "Divisions", href: "/app/divisions", icon: Folder },
    { name: "Tasks", href: "/app/tasks", icon: CheckSquare },
    { name: "Events", href: "/app/events", icon: Calendar },
    { name: "Finance", href: "/app/finance", icon: DollarSign },
    { name: "Members", href: "/app/members", icon: Users },
    { name: "Settings", href: "/app/settings", icon: Settings },
  ];

  const isActive = $derived((href: string) => {
    if (href === "/app") {
      return $page.url.pathname === "/app";
    }
    return $page.url.pathname.startsWith(href);
  });

  // Get user initials
  const userInitials = $derived(() => {
    if (!user?.full_name) return "?";
    const names = user.full_name.split(" ");
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  });

  // Close on ESC
  $effect(() => {
    if (!isOpen) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  });

  // Prevent body scroll when open
  $effect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  });
</script>

{#if isOpen}
  <!-- Backdrop -->
  <button
    type="button"
    class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
    onclick={onClose}
    aria-label="Close menu"
  ></button>

  <!-- Drawer -->
  <div
    class="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-xl z-50 lg:hidden transform transition-transform duration-300 ease-out"
  >
    <div class="flex flex-col h-full">
      <!-- Header with user info -->
      <div
        class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800"
      >
        <div class="flex items-center gap-3">
          <!-- Avatar -->
          <div
            class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium"
          >
            {userInitials()}
          </div>

          <!-- User info -->
          {#if user}
            <div>
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
        </div>

        <!-- Close button -->
        <button
          type="button"
          onclick={onClose}
          class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close menu"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {#each navigation as item}
          <a
            href={item.href}
            onclick={onClose}
            class="flex items-center gap-3 px-3 py-3 text-base font-medium rounded-lg transition-all duration-200 {isActive(
              item.href,
            )
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}"
          >
            <Icon
              this={item.icon}
              class="h-5 w-5 shrink-0 {isActive(item.href)
                ? 'text-white'
                : 'text-gray-500 dark:text-gray-400'}"
            />
            {item.name}
          </a>
        {/each}
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-gray-200 dark:border-gray-800">
        <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
          Sekre v1.0
        </p>
      </div>
    </div>
  </div>
{/if}
