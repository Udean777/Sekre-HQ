<script lang="ts">
  import type { FullAutoFill } from "svelte/elements";

  interface Props {
    type?:
      | "text"
      | "email"
      | "password"
      | "number"
      | "tel"
      | "url"
      | "date"
      | "datetime-local";
    name?: string;
    value?: string | number;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    autocomplete?: FullAutoFill;
    min?: string | number;
    max?: string | number;
    minlength?: number;
    maxlength?: number;
    pattern?: string;
  }

  let {
    type = "text",
    name,
    value = $bindable(""),
    placeholder,
    disabled = false,
    required = false,
    error,
    autocomplete,
    min,
    max,
    minlength,
    maxlength,
    pattern,
  }: Props = $props();

  const baseClasses =
    "appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 sm:text-sm";

  const normalClasses =
    "border-gray-300 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500";

  const errorClasses = "border-red-300 focus:ring-red-500 focus:border-red-500";

  // Use $derived for reactive classes
  const classes = $derived(
    error
      ? `${baseClasses} ${errorClasses}`
      : `${baseClasses} ${normalClasses}`,
  );
</script>

<input
  {type}
  {name}
  bind:value
  {placeholder}
  {disabled}
  {required}
  {autocomplete}
  {min}
  {max}
  {minlength}
  {maxlength}
  {pattern}
  class={classes}
  aria-invalid={error ? "true" : undefined}
  aria-describedby={error ? `${name}-error` : undefined}
/>
