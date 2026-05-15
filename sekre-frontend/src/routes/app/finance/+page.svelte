<script lang="ts">
  /**
   * Finance Page
   * Main page for financial management
   * Following SvelteKit 5 best practices with runes
   */
  import type { PageData, ActionData } from "./$types";
  import Button from "$lib/components/ui/Button.svelte";
  import Card from "$lib/components/ui/Card.svelte";
  import Select from "$lib/components/ui/Select.svelte";
  import Modal from "$lib/components/ui/Modal.svelte";
  import EmptyState from "$lib/components/ui/EmptyState.svelte";
  import Alert from "$lib/components/ui/Alert.svelte";
  import TransactionCard from "$lib/features/finance/TransactionCard.svelte";
  import TransactionForm from "$lib/features/finance/TransactionForm.svelte";
  import {
    groupTransactionsByType,
    sortTransactionsByDate,
    formatCurrency,
  } from "$lib/services/finance.service";
  import { enhance } from "$app/forms";
  import type { Transaction } from "$lib/api/types/finance.types";

  interface Props {
    data: PageData;
    form?: ActionData;
  }

  let { data, form }: Props = $props();

  // Modal state
  let isCreateModalOpen = $state(false);
  let isEditModalOpen = $state(false);
  let selectedTransaction = $state<Transaction | null>(null);
  let isSubmitting = $state(false);

  // Filter state
  let selectedDivision = $state("");
  let selectedType = $state("");
  let selectedStatus = $state("");

  $effect(() => {
    selectedDivision = (data as any).filters?.division_id || "";
    selectedType = (data as any).filters?.type || "";
    selectedStatus = (data as any).filters?.status || "";
  });

  // Group transactions
  const groupedTransactions = $derived(
    groupTransactionsByType(data.transactions),
  );

  function openCreateModal() {
    isCreateModalOpen = true;
  }

  function closeCreateModal() {
    isCreateModalOpen = false;
  }

  function openEditModal(transaction: Transaction) {
    selectedTransaction = transaction;
    isEditModalOpen = true;
  }

  function closeEditModal() {
    isEditModalOpen = false;
    selectedTransaction = null;
  }

  function applyFilters() {
    const params = new URLSearchParams();
    if (selectedDivision) params.set("division_id", selectedDivision);
    if (selectedType) params.set("type", selectedType);
    if (selectedStatus) params.set("status", selectedStatus);

    const query = params.toString();
    window.location.href = `/app/finance${query ? "?" + query : ""}`;
  }

  function clearFilters() {
    window.location.href = "/app/finance";
  }
</script>

<svelte:head>
  <title>Finance - Sekre</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Finance</h1>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Manage your organization's financial transactions
      </p>
    </div>
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
      New Transaction
    </Button>
  </div>

  <!-- Error messages -->
  {#if form?.error}
    <Alert variant="error" message={form.error} dismissible />
  {/if}

  {#if data.error}
    <Alert variant="error" message={data.error} dismissible />
  {/if}

  <!-- Financial Summary -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- Total Income -->
    <Card padding="lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Income
          </p>
          <p class="text-2xl font-bold text-green-600 mt-2">
            {formatCurrency(data.summary.total_income)}
          </p>
        </div>
        <div class="p-3 bg-green-100 rounded-full">
          <svg
            class="h-6 w-6 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 11l5-5m0 0l5 5m-5-5v12"
            />
          </svg>
        </div>
      </div>
    </Card>

    <!-- Total Expense -->
    <Card padding="lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Expense
          </p>
          <p class="text-2xl font-bold text-red-600 mt-2">
            {formatCurrency(data.summary.total_expense)}
          </p>
        </div>
        <div class="p-3 bg-red-100 rounded-full">
          <svg
            class="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 13l-5 5m0 0l-5-5m5 5V6"
            />
          </svg>
        </div>
      </div>
    </Card>

    <!-- Balance -->
    <Card padding="lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
            Balance
          </p>
          <p
            class="text-2xl font-bold mt-2"
            class:text-green-600={data.summary.balance >= 0}
            class:text-red-600={data.summary.balance < 0}
          >
            {formatCurrency(data.summary.balance)}
          </p>
        </div>
        <div
          class="p-3 rounded-full"
          class:bg-green-100={data.summary.balance >= 0}
          class:bg-red-100={data.summary.balance < 0}
        >
          <svg
            class="h-6 w-6"
            class:text-green-600={data.summary.balance >= 0}
            class:text-red-600={data.summary.balance < 0}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
    </Card>
  </div>

  <!-- Filters -->
  <Card padding="md">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Division filter -->
      <Select
        id="division-filter"
        name="division-filter"
        label="Division"
        bind:value={selectedDivision}
        options={[
          { value: "", label: "All Divisions" },
          ...data.divisions.map((division) => ({
            value: division.id,
            label: division.name,
          })),
        ]}
      />

      <!-- Type filter -->
      <Select
        id="type-filter"
        name="type-filter"
        label="Type"
        bind:value={selectedType}
        options={[
          { value: "", label: "All Types" },
          { value: "INCOME", label: "Income" },
          { value: "EXPENSE", label: "Expense" },
        ]}
      />

      <!-- Status filter -->
      <Select
        id="status-filter"
        name="status-filter"
        label="Status"
        bind:value={selectedStatus}
        options={[
          { value: "", label: "All Statuses" },
          { value: "PENDING", label: "Pending" },
          { value: "APPROVED", label: "Approved" },
          { value: "REJECTED", label: "Rejected" },
        ]}
      />

      <!-- Filter actions -->
      <div class="flex items-end gap-2">
        <div class="flex-1">
          <Button variant="primary" onclick={applyFilters}>Apply</Button>
        </div>
        <Button variant="secondary" onclick={clearFilters}>Clear</Button>
      </div>
    </div>
  </Card>

  <!-- Transactions List -->
  {#if data.transactions.length > 0}
    <div class="space-y-8">
      <!-- Income Transactions -->
      {#if groupedTransactions.income.length > 0}
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Income ({groupedTransactions.income.length})
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each sortTransactionsByDate(groupedTransactions.income) as transaction (transaction.id)}
              <TransactionCard
                {transaction}
                onclick={() => openEditModal(transaction)}
              />
            {/each}
          </div>
        </div>
      {/if}

      <!-- Expense Transactions -->
      {#if groupedTransactions.expense.length > 0}
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Expense ({groupedTransactions.expense.length})
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each sortTransactionsByDate(groupedTransactions.expense) as transaction (transaction.id)}
              <TransactionCard
                {transaction}
                onclick={() => openEditModal(transaction)}
              />
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <EmptyState
      title="No transactions yet"
      description="Get started by recording your first financial transaction."
    >
      <Button variant="primary" onclick={openCreateModal}
        >Create Transaction</Button
      >
    </EmptyState>
  {/if}
</div>

<!-- Create Transaction Modal -->
<Modal
  isOpen={isCreateModalOpen}
  onClose={closeCreateModal}
  title="Create New Transaction"
>
  <form
    method="POST"
    action="?/create"
    onsubmit={(e) => {
      const formData = new FormData(e.currentTarget);
      const type = formData.get("type") as string;
      const amount = formData.get("amount") as string;
      const description = formData.get("description") as string;
      const division_id = formData.get("division_id") as string;

      if (
        !type ||
        !amount ||
        parseFloat(amount) <= 0 ||
        !description?.trim() ||
        !division_id
      ) {
        e.preventDefault();
        return;
      }
    }}
    use:enhance={() => {
      isSubmitting = true;
      return async ({ result, update }) => {
        isSubmitting = false;

        if (result.type === "success") {
          closeCreateModal();
          await update();
        } else if (result.type === "failure") {
          await update();
        }
      };
    }}
  >
    <TransactionForm
      divisions={data.divisions}
      oncancel={closeCreateModal}
      loading={isSubmitting}
    />
  </form>
</Modal>

<!-- Edit Transaction Modal -->
{#if selectedTransaction}
  <Modal
    isOpen={isEditModalOpen}
    onClose={closeEditModal}
    title="Edit Transaction"
  >
    <form
      method="POST"
      action="?/update"
      onsubmit={(e) => {
        const formData = new FormData(e.currentTarget);
        const type = formData.get("type") as string;
        const amount = formData.get("amount") as string;
        const description = formData.get("description") as string;

        if (
          !type ||
          !amount ||
          parseFloat(amount) <= 0 ||
          !description?.trim()
        ) {
          e.preventDefault();
          return;
        }
      }}
      use:enhance={() => {
        isSubmitting = true;
        return async ({ result, update }) => {
          isSubmitting = false;

          if (result.type === "success") {
            closeEditModal();
            await update();
          } else if (result.type === "failure") {
            await update();
          }
        };
      }}
    >
      <input
        type="hidden"
        name="transaction_id"
        value={selectedTransaction.id}
      />
      <TransactionForm
        transaction={selectedTransaction}
        divisions={data.divisions}
        oncancel={closeEditModal}
        loading={isSubmitting}
      />
    </form>

    <!-- Delete button -->
    <form
      method="POST"
      action="?/delete"
      use:enhance={() => {
        return async ({ result, update }) => {
          if (result.type === "success") {
            closeEditModal();
            await update();
          } else if (result.type === "failure") {
            await update();
          }
        };
      }}
      class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
    >
      <input
        type="hidden"
        name="transaction_id"
        value={selectedTransaction.id}
      />
      <Button
        type="submit"
        variant="danger"
        onclick={() => {
          if (!confirm("Are you sure you want to delete this transaction?")) {
            return false;
          }
        }}
      >
        Delete Transaction
      </Button>
    </form>
  </Modal>
{/if}
