<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";
  import Alert from "$lib/components/ui/Alert.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Card from "$lib/components/ui/Card.svelte";

  let { form }: { form: ActionData } = $props();

  let showCurrentPassword = $state(false);
  let showNewPassword = $state(false);
  let showConfirmPassword = $state(false);
  let isSubmitting = $state(false);
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
      Security Settings
    </h2>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      Manage your password and security preferences
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
      <Input
        id="current_password"
        name="current_password"
        label="Current Password"
        type={showCurrentPassword ? "text" : "password"}
        required
        disabled={isSubmitting}
      />
      <div class="-mt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onclick={() => (showCurrentPassword = !showCurrentPassword)}
        >
          {showCurrentPassword ? "Hide" : "Show"} current password
        </Button>
      </div>

      <Input
        id="new_password"
        name="new_password"
        label="New Password"
        type={showNewPassword ? "text" : "password"}
        required
        disabled={isSubmitting}
      />
      <p class="-mt-3 text-xs text-gray-500 dark:text-gray-400">
        Minimum 8 characters
      </p>
      <div class="-mt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onclick={() => (showNewPassword = !showNewPassword)}
        >
          {showNewPassword ? "Hide" : "Show"} new password
        </Button>
      </div>

      <Input
        id="confirm_password"
        name="confirm_password"
        label="Confirm New Password"
        type={showConfirmPassword ? "text" : "password"}
        required
        disabled={isSubmitting}
      />
      <div class="-mt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onclick={() => (showConfirmPassword = !showConfirmPassword)}
        >
          {showConfirmPassword ? "Hide" : "Show"} confirm password
        </Button>
      </div>

      <div
        class="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end"
      >
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {isSubmitting ? "Changing Password..." : "Change Password"}
        </Button>
      </div>
    </form>
  </Card>
</div>
