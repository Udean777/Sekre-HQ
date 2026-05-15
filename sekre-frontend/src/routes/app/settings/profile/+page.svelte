<script lang="ts">
  import { enhance } from "$app/forms";
  import type { PageData, ActionData } from "./$types";
  import Alert from "$lib/components/ui/Alert.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Card from "$lib/components/ui/Card.svelte";

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let isSubmitting = $state(false);
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
      Profile Settings
    </h2>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      Update your personal information
    </p>
  </div>

  {#if form?.success}
    <Alert variant="success" message={form.message} />
  {/if}

  {#if form?.error}
    <Alert variant="error" message={form.error} />
  {/if}

  <Card padding="lg">
    <form
      method="POST"
      class="space-y-5"
      use:enhance={() => {
        isSubmitting = true;
        return async ({ update }) => {
          await update();
          isSubmitting = false;
        };
      }}
    >
      <div>
        <Input
          id="full_name"
          name="full_name"
          label="Full Name"
          type="text"
          value={data.user?.full_name || ""}
          required
          disabled={isSubmitting}
        />
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Your full name as it will appear throughout the application
        </p>
      </div>

      <div>
        <Input
          id="email"
          name="email"
          label="Email Address"
          type="email"
          value={data.user?.email || ""}
          required
          disabled={isSubmitting}
        />
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          A confirmation email will be sent to verify your new email address
        </p>
      </div>

      <div
        class="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end"
      >
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  </Card>
</div>
