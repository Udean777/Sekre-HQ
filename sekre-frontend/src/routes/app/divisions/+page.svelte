<script lang="ts">
  import type { PageData, ActionData } from "./$types";
  import Button from "$lib/components/ui/Button.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import EmptyState from "$lib/components/ui/EmptyState.svelte";
  import Alert from "$lib/components/ui/Alert.svelte";
  import DivisionForm from "$lib/features/divisions/DivisionForm.svelte";
  import DivisionCard from "$lib/features/divisions/DivisionCard.svelte";

  interface Props {
    data: PageData;
    form?: ActionData;
  }

  let { data, form }: Props = $props();

  let isCreateModalOpen = $state(false);

  function openCreateModal() {
    isCreateModalOpen = true;
  }

  function closeCreateModal() {
    isCreateModalOpen = false;
  }

  // Check if FREE plan limit reached (7 divisions)
  const isFreePlan = $derived(data.organization?.subscription_plan === "FREE");
  const maxDivisions = 7;
  const canCreateMore = $derived(
    !isFreePlan || data.divisions.length < maxDivisions,
  );
</script>

<svelte:head>
  <title>Divisions - Sekre</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Divisions</h1>
      <p class="mt-1 text-sm text-gray-500">
        Manage your organization's divisions and teams
      </p>
    </div>
    <Button
      variant="primary"
      onclick={openCreateModal}
      disabled={!canCreateMore}
    >
      <svg
        class="h-5 w-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4v16m8-8H4"
        />
      </svg>
      New Division
    </Button>
  </div>

  <!-- Free plan limit warning -->
  {#if isFreePlan && data.divisions.length >= maxDivisions}
    <Alert variant="warning" title="Division Limit Reached">
      You've reached the maximum of {maxDivisions} divisions on the FREE plan. Upgrade
      to LITE or PRO to create more divisions.
    </Alert>
  {:else if isFreePlan}
    <Alert variant="info">
      FREE plan: {data.divisions.length} / {maxDivisions} divisions used
    </Alert>
  {/if}

  <!-- Error message -->
  {#if form?.error}
    <Alert variant="error" message={form.error} dismissible />
  {/if}

  <!-- Divisions grid -->
  {#if data.divisions.length > 0}
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each data.divisions as division (division.id)}
        <DivisionCard {division} />
      {/each}
    </div>
  {:else}
    <EmptyState
      title="No divisions yet"
      description="Get started by creating your first division to organize your team."
    >
      <Button variant="primary" onclick={openCreateModal}>
        <svg
          class="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Create Division
      </Button>
    </EmptyState>
  {/if}
</div>

<!-- Create Division Modal -->
<Modal
  isOpen={isCreateModalOpen}
  title="Create New Division"
  onClose={closeCreateModal}
>
  <DivisionForm {form} onCancel={closeCreateModal} />
</Modal>
