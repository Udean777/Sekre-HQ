<script lang="ts">
  interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
  }

  interface Props {
    name: string;
    id?: string;
    value?: string;
    label?: string;
    placeholder?: string;
    options: SelectOption[];
    disabled?: boolean;
    required?: boolean;
    error?: string;
    class?: string;
    onchange?: (e: Event) => void;
  }

  let {
    name,
    id,
    value = $bindable(""),
    label,
    placeholder,
    options,
    disabled = false,
    required = false,
    error,
    class: className = "",
    onchange,
  }: Props = $props();

  const selectId = $derived(id || name);

  const baseClasses =
    "block w-full rounded-lg border px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-100";

  const normalClasses =
    "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600";
  const errorClasses =
    "border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600";

  const selectClasses = $derived(
    `${baseClasses} ${error ? errorClasses : normalClasses} ${className}`,
  );
</script>

{#if label}
  <label
    for={selectId}
    class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
  >
    {label}
    {#if required}
      <span class="text-red-500">*</span>
    {/if}
  </label>
{/if}

<select
  id={selectId}
  {name}
  bind:value
  {disabled}
  {required}
  class={selectClasses}
  aria-invalid={!!error}
  aria-describedby={error ? `${selectId}-error` : undefined}
  {onchange}
>
  {#if placeholder}
    <option value="" disabled={required}>{placeholder}</option>
  {/if}
  {#each options as option}
    <option value={option.value} disabled={option.disabled}>
      {option.label}
    </option>
  {/each}
</select>

{#if error}
  <p
    id="{selectId}-error"
    class="mt-1 text-sm text-red-600 dark:text-red-400"
    role="alert"
  >
    {error}
  </p>
{/if}
