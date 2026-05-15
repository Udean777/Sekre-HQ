<script lang="ts">
  import { Loader2 } from "lucide-svelte";

  interface Props {
    size?: "sm" | "md" | "lg";
    text?: string;
    class?: string;
  }

  let { size = "md", text, class: className = "" }: Props = $props();

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const classes = $derived(
    `animate-spin text-blue-600 dark:text-blue-400 ${sizeClasses[size]} ${className}`,
  );
</script>

<div class="flex flex-col items-center justify-center gap-3">
  <Loader2 class={classes} />
  {#if text}
    <p class="text-sm text-gray-600 dark:text-gray-400">{text}</p>
  {/if}
</div>
