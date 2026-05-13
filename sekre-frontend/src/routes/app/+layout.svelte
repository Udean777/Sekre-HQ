<script lang="ts">
  import type { Snippet } from "svelte";
  import type { LayoutData } from "./$types";
  import AppSidebar from "$lib/components/layout/AppSidebar.svelte";
  import AppHeader from "$lib/components/layout/AppHeader.svelte";
  import MobileNav from "$lib/components/layout/MobileNav.svelte";
  import UserMenu from "$lib/components/layout/UserMenu.svelte";

  interface Props {
    children: Snippet;
    data: LayoutData;
  }

  let { children, data }: Props = $props();
  let isMobileMenuOpen = $state(false);

  function openMobileMenu() {
    isMobileMenuOpen = true;
  }

  function closeMobileMenu() {
    isMobileMenuOpen = false;
  }
</script>

<div class="min-h-screen bg-gray-100">
  <!-- Mobile navigation -->
  <MobileNav isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />

  <!-- Desktop sidebar -->
  <div class="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
    <AppSidebar />
  </div>

  <!-- Main content -->
  <div class="lg:pl-64 flex flex-col flex-1">
    <!-- Header -->
    <AppHeader organization={data.organization} onMenuClick={openMobileMenu}>
      {#snippet userMenu()}
        <UserMenu user={data.user} />
      {/snippet}
    </AppHeader>

    <!-- Page content -->
    <main class="flex-1">
      <div class="py-6">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {@render children()}
        </div>
      </div>
    </main>
  </div>
</div>
