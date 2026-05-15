<script lang="ts">
  import { enhance } from "$app/forms";
  import { goto } from "$app/navigation";
  import type { PageData, ActionData } from "./$types";
  import Alert from "$lib/components/ui/Alert.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Input from "$lib/components/ui/Input.svelte";
  import Card from "$lib/components/ui/Card.svelte";

  let { data, form }: { data: PageData; form: ActionData } = $props();

  let isSubmitting = $state(false);
  let showDeleteModal = $state(false);
  let deleteConfirmation = $state("");
  let isDeleting = $state(false);

  let canEdit = $derived(data.role && ["OWNER", "ADMIN"].includes(data.role));
  let canDelete = $derived(data.role === "OWNER");

  function closeDeleteModal() {
    showDeleteModal = false;
    isDeleting = false;
  }
</script>

<div class="organization-settings space-y-6">
  <div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
      Organization Settings
    </h2>
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      Manage your organization information
    </p>
  </div>

  {#if !canEdit}
    <Alert
      variant="warning"
      message="Only organization owners and admins can modify these settings."
    />
  {/if}

  <Card padding="lg">
    <form
      method="POST"
      action="?/update"
      use:enhance={() => {
        isSubmitting = true;
        return async ({ update }) => {
          await update();
          isSubmitting = false;
        };
      }}
    >
      <div class="space-y-1">
        <Input
          type="text"
          id="name"
          name="name"
          label="Organization Name"
          value={data.organization?.name || ""}
          required
          disabled={!canEdit || isSubmitting}
        />
        <small class="text-sm text-gray-500 dark:text-gray-400"
          >The name of your organization as it appears throughout the
          application</small
        >
      </div>

      <div class="space-y-1">
        <Input
          id="subscription_plan"
          name="subscription_plan"
          label="Subscription Plan"
          type="text"
          value={data.organization?.subscription_plan || ""}
          disabled
        />
        <small class="text-sm text-gray-500 dark:text-gray-400"
          >Contact support to change your subscription plan</small
        >
      </div>

      {#if form?.success}
        <Alert variant="success" message={form.message} />
      {/if}

      {#if form?.error}
        <Alert variant="error" message={form.error} />
      {/if}

      {#if canEdit}
        <div
          class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      {/if}
    </form>
  </Card>

  {#if canDelete}
    <Card
      padding="lg"
      class="border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
    >
      <h3 class="text-xl font-semibold text-red-800 dark:text-red-200">
        Danger Zone
      </h3>
      <p class="mt-2 text-red-700 dark:text-red-300">
        Once you delete your organization, there is no going back. Please be
        certain.
      </p>
      <Button
        class="mt-4"
        type="button"
        variant="danger"
        onclick={() => (showDeleteModal = true)}
      >
        Delete Organization
      </Button>
    </Card>
  {/if}
</div>

{#if showDeleteModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="w-full max-w-lg overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow-xl"
    >
      <div
        class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-5"
      >
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
          Delete Organization
        </h3>
        <button
          class="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          aria-label="Close modal"
          onclick={closeDeleteModal}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="p-5 space-y-4">
        <div
          class="flex flex-col items-center rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            ></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <h4 class="mt-2 text-lg font-semibold text-red-800 dark:text-red-200">
            This action cannot be undone
          </h4>
        </div>

        <p class="text-gray-800 dark:text-gray-200">
          This will permanently delete the <strong
            >{data.organization?.name}</strong
          > organization and all of its data, including:
        </p>
        <ul class="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-1">
          <li>All divisions and members</li>
          <li>All tasks and events</li>
          <li>All finance records</li>
          <li>All audit logs</li>
        </ul>

        <form
          method="POST"
          action="?/delete"
          use:enhance={() => {
            isDeleting = true;
            return async ({ result, update }) => {
              if (result.type === "success") {
                await goto("/logout");
                return;
              }
              await update();
              isDeleting = false;
            };
          }}
        >
          <div class="space-y-1">
            <label
              for="delete_confirmation"
              class="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Type <strong>{data.organization?.name}</strong> to confirm:
            </label>
            <Input
              type="text"
              id="delete_confirmation"
              name="delete_confirmation"
              bind:value={deleteConfirmation}
              placeholder="Organization name"
              disabled={isDeleting}
            />
          </div>

          <div
            class="mt-5 flex gap-3 justify-end border-t border-gray-200 dark:border-gray-700 pt-4"
          >
            <Button
              type="button"
              variant="secondary"
              onclick={closeDeleteModal}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={deleteConfirmation !== data.organization?.name ||
                isDeleting}
              loading={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Organization"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}
