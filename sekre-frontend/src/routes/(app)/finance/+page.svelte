<script lang="ts">
	import { onMount } from 'svelte';
	import { financeService } from '$lib/features/finance/services';
	import { divisionService } from '$lib/features/divisions/services';
	import type {
		Transaction,
		CreateTransactionRequest,
		FinanceSummary
	} from '$lib/features/finance/types';
	import type { Division } from '$lib/features/divisions/types';

	let transactions = $state<Transaction[]>([]);
	let summary = $state<FinanceSummary>({ total_income: 0, total_expense: 0, balance: 0 });
	let divisions = $state<Division[]>([]);
	let selectedDivision = $state<string>('');
	let selectedType = $state<string>('');
	let isLoading = $state(true);
	let error = $state('');

	// Modal state
	let showModal = $state(false);
	let formData = $state<CreateTransactionRequest>({
		division_id: '',
		type: 'INCOME',
		amount: 0,
		description: ''
	});
	let formError = $state('');
	let isSubmitting = $state(false);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		try {
			isLoading = true;
			error = '';

			const [divisionsData, transactionsData] = await Promise.all([
				divisionService.list(),
				financeService.listTransactions({ division_id: selectedDivision, type: selectedType })
			]);

			divisions = divisionsData;
			transactions = transactionsData;

			// Load summary
			if (selectedDivision) {
				summary = await financeService.getSummary(selectedDivision);
			} else {
				summary = await financeService.getSummary();
			}
		} catch (err: any) {
			error = err.message || 'Failed to load data';
		} finally {
			isLoading = false;
		}
	}

	async function handleFilter() {
		await loadData();
	}

	function openModal() {
		formData = {
			division_id: selectedDivision || divisions[0]?.id || '',
			type: 'INCOME',
			amount: 0,
			description: ''
		};
		formError = '';
		showModal = true;
	}

	function closeModal() {
		showModal = false;
		formData = { division_id: '', type: 'INCOME', amount: 0, description: '' };
		formError = '';
	}

	async function handleSubmit() {
		try {
			isSubmitting = true;
			formError = '';

			if (!formData.division_id) {
				formError = 'Please select a division';
				return;
			}

			if (formData.amount <= 0) {
				formError = 'Amount must be greater than 0';
				return;
			}

			if (!formData.description.trim()) {
				formError = 'Description is required';
				return;
			}

			await financeService.createTransaction(formData);
			await loadData();
			closeModal();
		} catch (err: any) {
			formError = err.message || 'Failed to create transaction';
		} finally {
			isSubmitting = false;
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('Are you sure you want to delete this transaction?')) return;

		try {
			await financeService.deleteTransaction(id);
			transactions = transactions.filter((t) => t.id !== id);
			await loadData();
		} catch (err: any) {
			error = err.message || 'Failed to delete transaction';
		}
	}

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('id-ID', {
			style: 'currency',
			currency: 'IDR',
			minimumFractionDigits: 0
		}).format(amount);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Finance - Sekre</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold text-gray-900">Finance</h1>
		<button
			onclick={openModal}
			class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
		>
			+ Add Transaction
		</button>
	</div>

	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
			{error}
		</div>
	{/if}

	<!-- Summary Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<div class="bg-white rounded-lg shadow p-6">
			<div class="text-sm text-gray-600 mb-1">Total Income</div>
			<div class="text-2xl font-bold text-green-600">{formatCurrency(summary.total_income)}</div>
		</div>
		<div class="bg-white rounded-lg shadow p-6">
			<div class="text-sm text-gray-600 mb-1">Total Expense</div>
			<div class="text-2xl font-bold text-red-600">{formatCurrency(summary.total_expense)}</div>
		</div>
		<div class="bg-white rounded-lg shadow p-6">
			<div class="text-sm text-gray-600 mb-1">Balance</div>
			<div class="text-2xl font-bold text-blue-600">{formatCurrency(summary.balance)}</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="bg-white rounded-lg shadow p-4">
		<div class="flex gap-4">
			<div class="flex-1">
				<label for="filter-division" class="block text-sm font-medium text-gray-700 mb-1"
					>Division</label
				>
				<select
					id="filter-division"
					bind:value={selectedDivision}
					onchange={handleFilter}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				>
					<option value="">All Divisions</option>
					{#each divisions as division}
						<option value={division.id}>{division.name}</option>
					{/each}
				</select>
			</div>
			<div class="flex-1">
				<label for="filter-type" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
				<select
					id="filter-type"
					bind:value={selectedType}
					onchange={handleFilter}
					class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				>
					<option value="">All Types</option>
					<option value="INCOME">Income</option>
					<option value="EXPENSE">Expense</option>
				</select>
			</div>
		</div>
	</div>

	<!-- Transactions List -->
	<div class="bg-white rounded-lg shadow">
		<div class="px-6 py-4 border-b border-gray-200">
			<h2 class="text-lg font-semibold text-gray-900">Transactions</h2>
		</div>
		<div class="divide-y divide-gray-200">
			{#if isLoading}
				<div class="px-6 py-8 text-center text-gray-500">Loading...</div>
			{:else if transactions.length === 0}
				<div class="px-6 py-8 text-center text-gray-500">No transactions found</div>
			{:else}
				{#each transactions as transaction}
					<div class="px-6 py-4 hover:bg-gray-50">
						<div class="flex items-center justify-between">
							<div class="flex-1">
								<div class="flex items-center gap-3">
									<span
										class="px-2 py-1 text-xs font-medium rounded {transaction.type === 'INCOME'
											? 'bg-green-100 text-green-800'
											: 'bg-red-100 text-red-800'}"
									>
										{transaction.type}
									</span>
									<span class="font-medium text-gray-900">{transaction.description}</span>
								</div>
								<div class="mt-1 text-sm text-gray-500">
									{formatDate(transaction.created_at)}
								</div>
							</div>
							<div class="flex items-center gap-4">
								<div
									class="text-lg font-semibold {transaction.type === 'INCOME'
										? 'text-green-600'
										: 'text-red-600'}"
								>
									{transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
								</div>
								<button
									onclick={() => handleDelete(transaction.id)}
									class="text-red-600 hover:text-red-800"
								>
									Delete
								</button>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>

<!-- Create Transaction Modal -->
{#if showModal}
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
		<div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
			<div class="px-6 py-4 border-b border-gray-200">
				<h3 class="text-lg font-semibold text-gray-900">Add Transaction</h3>
			</div>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
				class="p-6 space-y-4"
			>
				{#if formError}
					<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
						{formError}
					</div>
				{/if}

				<div>
					<label for="form-division" class="block text-sm font-medium text-gray-700 mb-1"
						>Division</label
					>
					<select
						id="form-division"
						bind:value={formData.division_id}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="">Select division</option>
						{#each divisions as division}
							<option value={division.id}>{division.name}</option>
						{/each}
					</select>
				</div>

				<div>
					<label for="form-type" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
					<select
						id="form-type"
						bind:value={formData.type}
						required
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="INCOME">Income</option>
						<option value="EXPENSE">Expense</option>
					</select>
				</div>

				<div>
					<label for="form-amount" class="block text-sm font-medium text-gray-700 mb-1"
						>Amount (IDR)</label
					>
					<input
						id="form-amount"
						type="number"
						bind:value={formData.amount}
						required
						min="1"
						step="1000"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						placeholder="1000000"
					/>
				</div>

				<div>
					<label for="form-description" class="block text-sm font-medium text-gray-700 mb-1"
						>Description</label
					>
					<textarea
						id="form-description"
						bind:value={formData.description}
						required
						rows="3"
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						placeholder="Enter transaction description"
					></textarea>
				</div>

				<div class="flex gap-3 pt-4">
					<button
						type="button"
						onclick={closeModal}
						disabled={isSubmitting}
						class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={isSubmitting}
						class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
					>
						{isSubmitting ? 'Creating...' : 'Create'}
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
