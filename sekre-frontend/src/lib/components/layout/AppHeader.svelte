<script lang="ts">
  import type { Snippet } from "svelte";
  import type { Organization } from "$lib/api/types";
  import Badge from "$lib/components/ui/Badge.svelte";

  interface Props {
    organization: Organization | undefined;
    onMenuClick: () => void;
    userMenu: Snippet;
  }

  let { organization, onMenuClick, userMenu }: Props = $props();

  function getPlanVariant(plan: string): "default" | "success" | "info" {
    if (plan === "PRO") return "success";
    if (plan === "LITE") return "info";
    return "default";
  }
</script>

<header class="bg-white shadow-sm">
  <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
    <!-- Mobile menu button -->
    <button
      type="button"
      class="lg:hidden -ml-2 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
      onclick={onMenuClick}
    >
      <span class="sr-only">Open sidebar</span>
      <svg
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>

    <!-- Organization info -->
    <div class="flex items-center space-x-3">
      <h2 class="text-lg font-semibold text-gray-900">{organization?.name}</h2>
      <Badge variant={getPlanVariant(organization?.subscription_plan!)}>
        {organization?.subscription_plan}
      </Badge>
    </div>

    <!-- User menu -->
    <div class="flex items-center">
      {@render userMenu()}
    </div>
  </div>
</header>
