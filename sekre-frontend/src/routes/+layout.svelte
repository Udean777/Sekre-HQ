<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import Toast from "$lib/components/ui/Toast.svelte";
  import { themeStore } from "$lib/stores";

  let { children } = $props();

  // Initialize theme on mount
  $effect(() => {
    // Theme store auto-applies on init
  });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{@render children()}

<!-- Global Toast Notifications -->
<Toast />
