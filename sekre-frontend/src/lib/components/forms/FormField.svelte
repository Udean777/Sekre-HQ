<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    label: string;
    id: string;
    required?: boolean;
    error?: string;
    hint?: string;
    children: Snippet;
  }

  let {
    label,
    id,
    required = false,
    error,
    hint,
    children,
  }: Props = $props();
</script>

<!--
 * FormField Component - Svelte 5 Runes
 * Form field wrapper with label, error, and hint display
 -->

<div class="space-y-1">
  <label
    for={id}
    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
  >
    {label}
    {#if required}
      <span class="text-red-500">*</span>
    {/if}
  </label>

  {@render children()}

  {#if hint && !error}
    <p class="text-xs text-gray-500 dark:text-gray-400">
      {hint}
    </p>
  {/if}

  {#if error}
    <p
      id="{id}-error"
      class="text-sm text-red-600 dark:text-red-400"
      role="alert"
    >
      {error}
    </p>
  {/if}
</div>
