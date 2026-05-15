<script lang="ts">
  import { page } from "$app/stores";
  import { ChevronRight, Home } from "lucide-svelte";

  interface Breadcrumb {
    label: string;
    href: string;
  }

  // Generate breadcrumbs from pathname
  const breadcrumbs = $derived(() => {
    const pathname = $page.url.pathname;
    const segments = pathname.split("/").filter(Boolean);

    // Always start with home
    const crumbs: Breadcrumb[] = [{ label: "Home", href: "/app" }];

    // Skip if on home page
    if (segments.length <= 1) return crumbs;

    // Build breadcrumbs from segments
    let currentPath = "";
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      // Format label (capitalize, replace hyphens)
      const label = segment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      crumbs.push({
        label,
        href: currentPath,
      });
    }

    return crumbs;
  });

  // Check if current page
  const isCurrent = $derived((href: string) => {
    return $page.url.pathname === href;
  });
</script>

{#if breadcrumbs().length > 1}
  <nav aria-label="Breadcrumb" class="flex items-center space-x-2 text-sm">
    {#each breadcrumbs() as crumb, index}
      {#if index > 0}
        <ChevronRight class="h-4 w-4 text-gray-400 dark:text-gray-600" />
      {/if}

      {#if isCurrent(crumb.href)}
        <span
          class="font-medium text-gray-900 dark:text-gray-100"
          aria-current="page"
        >
          {crumb.label}
        </span>
      {:else}
        <a
          href={crumb.href}
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        >
          {#if index === 0}
            <Home class="h-4 w-4" />
          {:else}
            {crumb.label}
          {/if}
        </a>
      {/if}
    {/each}
  </nav>
{/if}
