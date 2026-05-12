<script lang="ts">
  /**
   * TransactionCard Component
   * Displays a single transaction in card format
   * Following SvelteKit 5 best practices with runes
   */
  import { toTransactionViewModel } from "$lib/services/finance.service";
  import type { Transaction } from "$lib/api/types/finance.types";

  interface Props {
    transaction: Transaction;
    onclick?: () => void;
  }

  let { transaction, onclick }: Props = $props();

  // Transform to view model with computed properties
  const viewModel = $derived(toTransactionViewModel(transaction));
</script>

<button
  type="button"
  class="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  {onclick}
>
  <!-- Header: Type & Status -->
  <div class="flex items-start justify-between mb-2">
    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      class:bg-green-100={viewModel.typeColor === "green"}
      class:text-green-800={viewModel.typeColor === "green"}
      class:bg-red-100={viewModel.typeColor === "red"}
      class:text-red-800={viewModel.typeColor === "red"}
    >
      {viewModel.typeLabel}
    </span>

    <span
      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      class:bg-yellow-100={viewModel.statusColor === "yellow"}
      class:text-yellow-800={viewModel.statusColor === "yellow"}
      class:bg-green-100={viewModel.statusColor === "green"}
      class:text-green-800={viewModel.statusColor === "green"}
      class:bg-red-100={viewModel.statusColor === "red"}
      class:text-red-800={viewModel.statusColor === "red"}
    >
      {viewModel.statusLabel}
    </span>
  </div>

  <!-- Amount -->
  <div class="mb-2">
    <p
      class="text-2xl font-bold"
      class:text-green-600={transaction.type === "INCOME"}
      class:text-red-600={transaction.type === "EXPENSE"}
    >
      {viewModel.formattedAmount}
    </p>
  </div>

  <!-- Description -->
  <p class="text-sm text-gray-900 mb-3 line-clamp-2">
    {transaction.description}
  </p>

  <!-- Footer: Date -->
  <div class="flex items-center justify-between text-xs text-gray-500">
    <div class="flex items-center gap-1">
      <svg
        class="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <span>{viewModel.formattedDate}</span>
    </div>

    {#if transaction.receipt_url}
      <div class="flex items-center gap-1 text-blue-600">
        <svg
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span>Receipt</span>
      </div>
    {/if}
  </div>
</button>
