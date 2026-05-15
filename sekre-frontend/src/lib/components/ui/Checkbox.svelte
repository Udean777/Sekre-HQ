<script lang="ts">
  interface Props {
    name: string;
    id?: string;
    label: string;
    checked?: boolean;
    disabled?: boolean;
    description?: string;
    error?: string;
    class?: string;
    onchange?: (e: Event) => void;
  }

  let {
    name,
    id,
    label,
    checked = $bindable(false),
    disabled = false,
    description,
    error,
    class: className = "",
    onchange,
  }: Props = $props();

  const checkboxId = $derived(id || name);
</script>

<label
  class={`flex items-start gap-3 ${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${className}`}
>
  <input
    id={checkboxId}
    type="checkbox"
    {name}
    bind:checked
    {disabled}
    class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800"
    aria-invalid={!!error}
    aria-describedby={error ? `${checkboxId}-error` : undefined}
    {onchange}
  />
  <span class="flex-1">
    <span class="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </span>
    {#if description}
      <span class="block text-xs text-gray-500 dark:text-gray-400 mt-1"
        >{description}</span
      >
    {/if}
    {#if error}
      <span
        id="{checkboxId}-error"
        class="block text-sm text-red-600 dark:text-red-400 mt-1"
        role="alert"
      >
        {error}
      </span>
    {/if}
  </span>
</label>
