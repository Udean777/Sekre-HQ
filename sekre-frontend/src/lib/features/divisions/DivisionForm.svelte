<script lang="ts">
  import { enhance } from "$app/forms";
  import Input from "$lib/components/ui/Input.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Field from "$lib/components/ui/Field.svelte";

  interface Props {
    form?: {
      error?: string;
      name?: string;
    } | null;
    onCancel?: () => void;
  }

  let { form, onCancel }: Props = $props();

  let isSubmitting = $state(false);
  let name = $state("");

  // Update name when form changes
  $effect(() => {
    if (form?.name) {
      name = form.name;
    }
  });
</script>

<form
  method="POST"
  action="?/create"
  class="space-y-4"
  use:enhance={() => {
    isSubmitting = true;
    return async ({ update }) => {
      await update();
      isSubmitting = false;
    };
  }}
>
  <Field label="Division Name" for="name" required error={form?.error}>
    <Input
      type="text"
      name="name"
      bind:value={name}
      placeholder="e.g., Divisi IPTEK"
      required
      error={form?.error}
    />
  </Field>

  <div class="flex justify-end space-x-3">
    {#if onCancel}
      <Button type="button" variant="secondary" onclick={onCancel}
        >Cancel</Button
      >
    {/if}
    <Button type="submit" variant="primary" loading={isSubmitting}>
      Create Division
    </Button>
  </div>
</form>
