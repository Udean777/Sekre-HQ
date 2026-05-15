<script lang="ts">
  interface Props {
    name: string;
    id?: string;
    label: string;
    value: string;
    group?: string;
    disabled?: boolean;
    description?: string;
    class?: string;
    onchange?: (e: Event) => void;
  }

  let {
    name,
    id,
    label,
    value,
    group = $bindable(""),
    disabled = false,
    description,
    class: className = "",
    onchange,
  }: Props = $props();

  const radioId = $derived(id || `${name}-${value}`);
</script>

<label
  class={`flex items-start gap-3 ${disabled ? "cursor-not-allowed" : "cursor-pointer"} ${className}`}
>
  <input
    id={radioId}
    type="radio"
    {name}
    bind:group
    {value}
    {disabled}
    class="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800"
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
  </span>
</label>
