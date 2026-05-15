<script lang="ts">
  interface Props {
    type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
    name: string;
    id?: string;
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    label?: string;
    autocomplete?: AutoFill;
    class?: string;
    oninput?: (e: Event) => void;
    onchange?: (e: Event) => void;
  }

  let {
    type = "text",
    name,
    id,
    value = $bindable(""),
    placeholder,
    disabled = false,
    required = false,
    error,
    label,
    autocomplete,
    class: className = "",
    oninput,
    onchange,
  }: Props = $props();

  const inputId = $derived(id || name);

  const baseClasses =
    "block w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500";

  const normalClasses =
    "border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600";
  const errorClasses =
    "border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600";

  const inputClasses = $derived(
    `${baseClasses} ${error ? errorClasses : normalClasses} ${className}`,
  );
  
  // Handle input event to sync value
  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    oninput?.(e);
  }
  
  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    onchange?.(e);
  }
</script>

{#if label}
  <label
    for={inputId}
    class="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300"
  >
    {label}
    {#if required}
      <span class="text-red-500">*</span>
    {/if}
  </label>
{/if}

<input
  id={inputId}
  {name}
  {type}
  value={value}
  {placeholder}
  {disabled}
  {required}
  {autocomplete}
  class={inputClasses}
  aria-invalid={!!error}
  aria-describedby={error ? `${inputId}-error` : undefined}
  oninput={handleInput}
  onchange={handleChange}
/>

{#if error}
  <p
    id="{inputId}-error"
    class="mt-1 text-sm text-red-600 dark:text-red-400"
    role="alert"
  >
    {error}
  </p>
{/if}
