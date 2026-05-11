<script lang="ts">
  import { page } from "$app/stores";

  interface NavItem {
    name: string;
    href: string;
    icon: string;
  }

  const navigation: NavItem[] = [
    { name: "Dashboard", href: "/app", icon: "home" },
    { name: "Divisions", href: "/app/divisions", icon: "folder" },
    { name: "Tasks", href: "/app/tasks", icon: "check-square" },
    { name: "Events", href: "/app/events", icon: "calendar" },
    { name: "Finance", href: "/app/finance", icon: "dollar-sign" },
  ];

  function isActive(href: string): boolean {
    if (href === "/app") {
      return $page.url.pathname === "/app";
    }
    return $page.url.pathname.startsWith(href);
  }

  function getIcon(icon: string): string {
    const icons: Record<string, string> = {
      home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
      folder:
        "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z",
      "check-square":
        "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
      calendar:
        "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
      "dollar-sign":
        "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    };
    return icons[icon] || "";
  }
</script>

<div class="flex flex-col h-full bg-gray-900">
  <!-- Logo -->
  <div class="flex items-center h-16 shrink-0 px-4 bg-gray-900">
    <h1 class="text-xl font-bold text-white">Sekre</h1>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
    {#each navigation as item}
      <a
        href={item.href}
        class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors {isActive(
          item.href,
        )
          ? 'bg-gray-800 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'}"
      >
        <svg
          class="mr-3 h-6 w-6 shrink-0 {isActive(item.href)
            ? 'text-white'
            : 'text-gray-400 group-hover:text-gray-300'}"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d={getIcon(item.icon)}
          />
        </svg>
        {item.name}
      </a>
    {/each}
  </nav>
</div>
