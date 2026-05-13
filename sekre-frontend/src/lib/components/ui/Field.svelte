<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    label: string;
    for?: string;
    error?: string;
    helperText?: string;
    required?: boolean;
    children: Snippet;
  }

  let {
    label,
    for: htmlFor,
    error,
    helperText,
    required = false,
    children,
  }: Props = $props();
</script>

<div class="space-y-1">
  <label for={htmlFor} class="block text-sm font-medium text-gray-700">
    {label}
    {#if required}
      <span class="text-red-500">*</span>
    {/if}
  </label>
  {@render children()}
  {#if error}
    <p class="text-sm text-red-600" id="{htmlFor}-error">{error}</p>
  {:else if helperText}
    <p class="text-sm text-gray-500">{helperText}</p>
  {/if}
</div>
