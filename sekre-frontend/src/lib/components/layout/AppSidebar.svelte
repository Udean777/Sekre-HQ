<script lang="ts">
  import { page } from "$app/stores";
  import {
    Home,
    Folder,
    CheckSquare,
    Calendar,
    DollarSign,
    Users,
    Settings,
    Icon,
  } from "lucide-svelte";
  import type { ComponentType } from "svelte";

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
  ];

  // Derived active state
  const isActive = $derived((href: string) => {
    if (href === "/app") {
      return $page.url.pathname === "/app";
    }
    return $page.url.pathname.startsWith(href);
  });
</script>

<div class="flex flex-col h-full bg-gray-900 dark:bg-gray-950">
  <!-- Logo -->
  <div
    class="flex items-center h-16 shrink-0 px-6 border-b border-gray-800 dark:border-gray-900"
  >
    <h1 class="text-xl font-bold text-white">Sekre</h1>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
    {#each navigation as item}
      <a
        href={item.href}
        class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 {isActive(
          item.href,
        )
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
          : 'text-gray-300 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-900'}"
      >
        <Icon
          this={item.icon}
          class="mr-3 h-5 w-5 shrink-0 {isActive(item.href)
            ? 'text-white'
            : 'text-gray-400 group-hover:text-gray-300'}"
        />
        {item.name}
      </a>
    {/each}
  </nav>

  <!-- Settings at bottom -->
  <div class="px-3 py-4 border-t border-gray-800 dark:border-gray-900">
    <a
      href="/app/settings"
      class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 {isActive(
        '/app/settings',
      )
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white dark:hover:bg-gray-900'}"
    >
      <Settings
        class="mr-3 h-5 w-5 shrink-0 {isActive('/app/settings')
          ? 'text-white'
          : 'text-gray-400 group-hover:text-gray-300'}"
      />
      Settings
    </a>
  </div>
</div>
