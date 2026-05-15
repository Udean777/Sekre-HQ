<script lang="ts">
  import type { Snippet } from "svelte";
  import type { LayoutData } from "./$types";
  import AppSidebar from "$lib/components/layout/AppSidebar.svelte";
  import AppHeader from "$lib/components/layout/AppHeader.svelte";
  import MobileNav from "$lib/components/layout/MobileNav.svelte";
  import Container from "$lib/components/layout/Container.svelte";
  import { ErrorBoundary } from "$lib/components/ui";

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

<div class="flex h-screen bg-gray-50 dark:bg-gray-950">
  <!-- Desktop sidebar -->
  <div class="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
    <AppSidebar />
  </div>

  <!-- Mobile navigation -->
  <MobileNav isOpen={isMobileMenuOpen} onClose={closeMobileMenu} user={data.user} organization={data.organization} />

  <!-- Main content area -->
  <div class="flex-1 flex flex-col lg:pl-64">
    <!-- Header -->
    <AppHeader onMenuClick={openMobileMenu} user={data.user} organization={data.organization} />

    <!-- Page content -->
    <main class="flex-1 overflow-auto">
      <Container size="xl" centered>
        <ErrorBoundary>
          {@render children()}
        </ErrorBoundary>
      </Container>
    </main>
  </div>
</div>
