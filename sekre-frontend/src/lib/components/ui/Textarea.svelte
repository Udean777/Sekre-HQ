<script lang="ts">
  interface Props {
    name: string;
    id?: string;
    value?: string;
    label?: string;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    maxlength?: number;
    class?: string;
    oninput?: (e: Event) => void;
  }

  let {
    name,
    id,
    value = $bindable(""),
    label,
    placeholder,
    rows = 4,
    disabled = false,
    required = false,
    error,
    maxlength,
    class: className = "",
    oninput,
  }: Props = $props();

  const textareaId = $derived(id || name);

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

{#if label}
  <label
    for={textareaId}
    class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
  >
    {label}
    {#if required}
      <span class="text-red-500">*</span>
    {/if}
  </label>
{/if}

<textarea
  id={textareaId}
  {name}
  bind:value
  {placeholder}
  {rows}
  {disabled}
  {required}
  {maxlength}
  class={textareaClasses}
  aria-invalid={!!error}
  aria-describedby={error ? `${textareaId}-error` : undefined}
  {oninput}
></textarea>

{#if maxlength}
  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
    {(value ?? "").length}/{maxlength}
  </p>
{/if}

{#if error}
  <p
    id={`${textareaId}-error`}
    class="mt-1 text-sm text-red-600 dark:text-red-400"
    role="alert"
  >
    {error}
  </p>
{/if}
