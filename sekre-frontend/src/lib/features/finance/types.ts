export interface Transaction {
	id: string;
	organization_id: string;
	division_id: string;
	event_id: string | null;
	type: 'INCOME' | 'EXPENSE';
	amount: number;
	description: string;
	status: 'PENDING' | 'APPROVED' | 'REJECTED';
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

export interface CreateTransactionRequest {
	division_id: string;
	event_id?: string;
	type: 'INCOME' | 'EXPENSE';
	amount: number;
	description: string;
	receipt_url?: string;
}

export interface UpdateTransactionRequest {
	type: 'INCOME' | 'EXPENSE';
	amount: number;
	description: string;
	receipt_url?: string;
}
