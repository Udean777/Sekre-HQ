/**
 * Finance Service
 * Following Clean Architecture - Application layer
 * Contains business logic and data transformation
 */

import type {
	Transaction,
	TransactionViewModel,
	TransactionType,
	TransactionStatus
} from '$lib/api/types/finance.types';

/**
 * Transform transaction to view model with computed properties
 */
export function toTransactionViewModel(transaction: Transaction): TransactionViewModel {
	return {
		...transaction,
		typeColor: getTypeColor(transaction.type),
		typeLabel: getTypeLabel(transaction.type),
		statusColor: getStatusColor(transaction.status),
		statusLabel: getStatusLabel(transaction.status),
		formattedAmount: formatAmount(transaction.amount, transaction.type),
		formattedDate: formatDate(transaction.created_at)
	};
}

/**
 * Get color for transaction type
 */
function getTypeColor(type: TransactionType): string {
	return type === 'INCOME' ? 'green' : 'red';
}

/**
 * Get label for transaction type
 */
function getTypeLabel(type: TransactionType): string {
	return type === 'INCOME' ? 'Income' : 'Expense';
}

/**
 * Get color for transaction status
 */
export function getStatusColor(status: TransactionStatus): string {
	switch (status) {
		case 'PENDING':
			return 'yellow';
		case 'APPROVED':
			return 'green';
		case 'REJECTED':
			return 'red';
		default:
			return 'gray';
	}
}

/**
 * Get label for transaction status
 */
export function getStatusLabel(status: TransactionStatus): string {
	switch (status) {
		case 'PENDING':
			return 'Pending';
		case 'APPROVED':
			return 'Approved';
		case 'REJECTED':
			return 'Rejected';
		default:
			return status;
	}
}

/**
 * Format amount with currency and sign
 */
export function formatAmount(amount: number, type: TransactionType): string {
	const formatted = new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount);

	return type === 'INCOME' ? `+${formatted}` : `-${formatted}`;
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
}

/**
 * Validate transaction form data
 */
export function validateTransactionForm(data: {
	type: string;
	amount: string;
	description: string;
	division_id: string;
}): { valid: boolean; errors: Record<string, string> } {
	const errors: Record<string, string> = {};

	if (!data.type) {
		errors.type = 'Type is required';
	}

	if (!data.amount || parseFloat(data.amount) <= 0) {
		errors.amount = 'Amount must be greater than 0';
	}

	if (!data.description.trim()) {
		errors.description = 'Description is required';
	}

	if (!data.division_id) {
		errors.division_id = 'Division is required';
	}

	return {
		valid: Object.keys(errors).length === 0,
		errors
	};
}

/**
 * Group transactions by status
 */
export function groupTransactionsByStatus(transactions: Transaction[]): {
	pending: Transaction[];
	approved: Transaction[];
	rejected: Transaction[];
} {
	return {
		pending: transactions.filter((t) => t.status === 'PENDING'),
		approved: transactions.filter((t) => t.status === 'APPROVED'),
		rejected: transactions.filter((t) => t.status === 'REJECTED')
	};
}

/**
 * Group transactions by type
 */
export function groupTransactionsByType(transactions: Transaction[]): {
	income: Transaction[];
	expense: Transaction[];
} {
	return {
		income: transactions.filter((t) => t.type === 'INCOME'),
		expense: transactions.filter((t) => t.type === 'EXPENSE')
	};
}

/**
 * Sort transactions by date (newest first)
 */
export function sortTransactionsByDate(transactions: Transaction[]): Transaction[] {
	return [...transactions].sort((a, b) => {
		return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
	});
}

/**
 * Calculate total for transactions
 */
export function calculateTotal(transactions: Transaction[]): number {
	return transactions.reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate balance from income and expense
 */
export function calculateBalance(income: number, expense: number): number {
	return income - expense;
}

/**
 * Format currency (IDR)
 */
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount);
}
