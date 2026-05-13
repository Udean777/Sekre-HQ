<script lang="ts">
  /**
   * TransactionForm Component
   * Form for creating and editing transactions
   * Following SvelteKit 5 best practices with runes
   */
  import Button from "$lib/components/ui/Button.svelte";
  import { validateTransactionForm } from "$lib/services/finance.service";
  import type { Transaction } from "$lib/api/types/finance.types";
  import type { Division } from "$lib/api/types";

  interface Props {
    transaction?: Transaction;
    divisions: Division[];
    oncancel: () => void;
    loading?: boolean;
  }

  let { transaction, divisions, oncancel, loading = false }: Props = $props();

  // Form state
  let formData = $derived({
    type: transaction?.type || "INCOME",
    amount: transaction?.amount?.toString() || "",
    description: transaction?.description || "",
    division_id: transaction?.division_id || "",
    receipt_url: transaction?.receipt_url || "",
  });

  let errors = $state<Record<string, string>>({});

  const isEditMode = $derived(!!transaction);
</script>

<div class="space-y-4">
  <!-- Type -->
  <div>
    <label for="type" class="block text-sm font-medium text-gray-700 mb-1">
      Type <span class="text-red-500">*</span>
    </label>
    <select
      id="type"
      name="type"
      bind:value={formData.type}
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      class:border-red-500={errors.type}
      required
    >
      <option value="INCOME">Income</option>
      <option value="EXPENSE">Expense</option>
    </select>
    {#if errors.type}
      <p class="mt-1 text-sm text-red-600">{errors.type}</p>
    {/if}
  </div>

  <!-- Amount -->
  <div>
    <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">
      Amount (IDR) <span class="text-red-500">*</span>
    </label>
    <input
      type="number"
      id="amount"
      name="amount"
      bind:value={formData.amount}
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      class:border-red-500={errors.amount}
      placeholder="0"
      min="0"
      step="1000"
      required
    />
    {#if errors.amount}
      <p class="mt-1 text-sm text-red-600">{errors.amount}</p>
    {/if}
  </div>

  <!-- Description -->
  <div>
    <label
      for="description"
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      Description <span class="text-red-500">*</span>
    </label>
    <textarea
      id="description"
      name="description"
      bind:value={formData.description}
      rows="3"
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      class:border-red-500={errors.description}
      placeholder="Enter transaction description"
      required
    ></textarea>
    {#if errors.description}
      <p class="mt-1 text-sm text-red-600">{errors.description}</p>
    {/if}
  </div>

  <!-- Division -->
  <div>
    <label
      for="division_id"
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      Division <span class="text-red-500">*</span>
    </label>
    <select
      id="division_id"
      name="division_id"
      bind:value={formData.division_id}
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      class:border-red-500={errors.division_id}
      disabled={isEditMode}
      required
    >
      <option value="">Select division</option>
      {#each divisions as division}
        <option value={division.id}>{division.name}</option>
      {/each}
    </select>
    {#if errors.division_id}
      <p class="mt-1 text-sm text-red-600">{errors.division_id}</p>
    {/if}
  </div>

  <!-- Receipt URL -->
  <div>
    <label
      for="receipt_url"
      class="block text-sm font-medium text-gray-700 mb-1"
    >
      Receipt URL
    </label>
    <input
      type="url"
      id="receipt_url"
      name="receipt_url"
      bind:value={formData.receipt_url}
      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="https://example.com/receipt.pdf"
    />
    <p class="mt-1 text-xs text-gray-500">Optional: Link to receipt document</p>
  </div>

  <!-- Actions -->
  <div class="flex justify-end gap-3 pt-4">
    <Button
      type="button"
      variant="secondary"
      onclick={oncancel}
      disabled={loading}
    >
      Cancel
    </Button>
    <Button type="submit" variant="primary" disabled={loading}>
      {loading
        ? "Saving..."
        : isEditMode
          ? "Update Transaction"
          : "Create Transaction"}
    </Button>
  </div>
</div>
