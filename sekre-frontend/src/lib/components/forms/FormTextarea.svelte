<script lang="ts">
  interface Props {
    label: string;
    name: string;
    value?: string;
    placeholder?: string;
    rows?: number;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    class?: string;
  }

  let {
    label,
    name,
    value = $bindable(""),
    placeholder,
    rows = 4,
    required = false,
    disabled = false,
    error,
    class: className = "",
  }: Props = $props();

  const baseClasses =
    "block w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500";

  const normalClasses =
    "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600";
  const errorClasses =
    "border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600";

  const textareaClasses = $derived(
    `${baseClasses} ${error ? errorClasses : normalClasses} ${className}`,
  );
</script>

<div class="space-y-1">
  <label
    for={name}
    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
  >
    {label}
    {#if required}
      <span class="text-red-500">*</span>
    {/if}
  </label>

  <textarea
    id={name}
    {name}
    bind:value
    {placeholder}
    {rows}
    {disabled}
    {required}
    class={textareaClasses}
    aria-invalid={!!error}
    aria-describedby={error ? `${name}-error` : undefined}
  ></textarea>

  {#if error}
    <p
      id="{name}-error"
      class="text-sm text-red-600 dark:text-red-400"
      role="alert"
    >
      {error}
    </p>
  {/if}
</div>
