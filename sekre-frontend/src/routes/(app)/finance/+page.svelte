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
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import { Plus, TrendingUp, TrendingDown, DollarSign, Loader2, Trash2 } from 'lucide-svelte';

	let transactions = $state<Transaction[]>([]);
	let summary = $state<FinanceSummary>({ total_income: 0, total_expense: 0, balance: 0 });
	let divisions = $state<Division[]>([]);
	let selectedDivision = $state<string>('');
	let selectedType = $state<string>('');
	let isLoading = $state(true);
	let error = $state('');

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

	function formatDate(date: string): string {
		return new Date(date).toLocaleDateString('id-ID', {
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
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Finance</h1>
			<p class="text-muted-foreground">Manage your organization's financial transactions</p>
		</div>
		<Button onclick={openModal}>
			<Plus class="mr-2 h-4 w-4" />
			New Transaction
		</Button>
	</div>

	{#if error}
		<Alert variant="destructive">
			<AlertDescription>{error}</AlertDescription>
		</Alert>
	{/if}

	<!-- Summary Cards -->
	<div class="grid gap-4 md:grid-cols-3">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Income</CardTitle>
				<TrendingUp class="h-4 w-4 text-green-600" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-green-600">{formatCurrency(summary.total_income)}</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Expense</CardTitle>
				<TrendingDown class="h-4 w-4 text-red-600" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-red-600">{formatCurrency(summary.total_expense)}</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Balance</CardTitle>
				<DollarSign class="h-4 w-4 text-blue-600" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold text-blue-600">{formatCurrency(summary.balance)}</div>
			</CardContent>
		</Card>
	</div>

	<!-- Filters -->
	<Card>
		<CardHeader>
			<CardTitle>Filters</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="grid gap-4 md:grid-cols-2">
				<div class="space-y-2">
					<Label for="filter-division">Division</Label>
					<select
						id="filter-division"
						bind:value={selectedDivision}
						onchange={handleFilter}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<option value="">All Divisions</option>
						{#each divisions as division}
							<option value={division.id}>{division.name}</option>
						{/each}
					</select>
				</div>

				<div class="space-y-2">
					<Label for="filter-type">Type</Label>
					<select
						id="filter-type"
						bind:value={selectedType}
						onchange={handleFilter}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<option value="">All Types</option>
						<option value="INCOME">Income</option>
						<option value="EXPENSE">Expense</option>
					</select>
				</div>
			</div>
		</CardContent>
	</Card>

	<!-- Transactions Table -->
	<Card>
		<CardHeader>
			<CardTitle>Transactions</CardTitle>
			<CardDescription>A list of all financial transactions</CardDescription>
		</CardHeader>
		<CardContent>
			{#if isLoading}
				<div class="flex items-center justify-center py-8">
					<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			{:else if transactions.length === 0}
				<div class="text-center py-8 text-muted-foreground">
					No transactions found
				</div>
			{:else}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Date</TableHead>
							<TableHead>Description</TableHead>
							<TableHead>Type</TableHead>
							<TableHead>Status</TableHead>
							<TableHead class="text-right">Amount</TableHead>
							<TableHead class="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each transactions as transaction}
							<TableRow>
								<TableCell class="font-medium">{formatDate(transaction.created_at)}</TableCell>
								<TableCell>{transaction.description}</TableCell>
								<TableCell>
									<Badge variant={transaction.type === 'INCOME' ? 'default' : 'secondary'}>
										{transaction.type}
									</Badge>
								</TableCell>
								<TableCell>
									<Badge
										variant={transaction.status === 'APPROVED'
											? 'default'
											: transaction.status === 'PENDING'
												? 'secondary'
												: 'destructive'}
									>
										{transaction.status}
									</Badge>
								</TableCell>
								<TableCell class="text-right font-medium">
									<span class={transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
										{transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
									</span>
								</TableCell>
								<TableCell class="text-right">
									<Button
										variant="ghost"
										size="sm"
										onclick={() => handleDelete(transaction.id)}
									>
										<Trash2 class="h-4 w-4" />
									</Button>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			{/if}
		</CardContent>
	</Card>
</div>

<!-- Create Transaction Dialog -->
<Dialog bind:open={showModal}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>Create Transaction</DialogTitle>
			<DialogDescription>Add a new financial transaction</DialogDescription>
		</DialogHeader>

		<form
			onsubmit={(e) => {
				e.preventDefault();
				handleSubmit();
			}}
		>
			<div class="space-y-4 py-4">
				{#if formError}
					<Alert variant="destructive">
						<AlertDescription>{formError}</AlertDescription>
					</Alert>
				{/if}

				<div class="space-y-2">
					<Label for="form-division">Division</Label>
					<select
						id="form-division"
						bind:value={formData.division_id}
						required
						disabled={isSubmitting}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<option value="">Select division</option>
						{#each divisions as division}
							<option value={division.id}>{division.name}</option>
						{/each}
					</select>
				</div>

				<div class="space-y-2">
					<Label for="form-type">Type</Label>
					<select
						id="form-type"
						bind:value={formData.type}
						required
						disabled={isSubmitting}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<option value="INCOME">Income</option>
						<option value="EXPENSE">Expense</option>
					</select>
				</div>

				<div class="space-y-2">
					<Label for="form-amount">Amount (IDR)</Label>
					<Input
						id="form-amount"
						type="number"
						bind:value={formData.amount}
						required
						min="1"
						step="1000"
						placeholder="1000000"
						disabled={isSubmitting}
					/>
				</div>

				<div class="space-y-2">
					<Label for="form-description">Description</Label>
					<Input
						id="form-description"
						type="text"
						bind:value={formData.description}
						required
						placeholder="Enter transaction description"
						disabled={isSubmitting}
					/>
				</div>
			</div>

			<DialogFooter>
				<Button type="button" variant="outline" onclick={closeModal} disabled={isSubmitting}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{#if isSubmitting}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Creating...
					{:else}
						Create
					{/if}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
