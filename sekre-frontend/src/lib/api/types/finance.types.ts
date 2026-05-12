/**
 * Transaction/Finance Domain Types
 * Following Clean Architecture principles - Domain entities
 */

export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Transaction {
	id: string;
	organization_id: string;
	division_id: string;
	event_id: string | null;
	type: TransactionType;
	amount: number;
	description: string;
	status: TransactionStatus;
	requested_by: string;
	approved_by: string | null;
	receipt_url: string | null;
	created_at: string;
	updated_at: string;
}

export interface FinanceSummary {
	total_income: number;
	total_expense: number;
	balance: number;
}

// DTOs (Data Transfer Objects)
export interface CreateTransactionDTO {
	division_id: string;
	event_id?: string | null;
	type: TransactionType;
	amount: number;
	description: string;
	receipt_url?: string | null;
}

export interface UpdateTransactionDTO {
	type: TransactionType;
	amount: number;
	description: string;
	receipt_url?: string | null;
}

export interface UpdateTransactionStatusDTO {
	status: TransactionStatus;
}

// Query filters
export interface TransactionFilters {
	division_id?: string;
	type?: TransactionType;
	status?: TransactionStatus;
	start_date?: string;
	end_date?: string;
}

// View Models (for UI)
export interface TransactionViewModel extends Transaction {
	typeColor: string;
	typeLabel: string;
	statusColor: string;
	statusLabel: string;
	formattedAmount: string;
	formattedDate: string;
}
