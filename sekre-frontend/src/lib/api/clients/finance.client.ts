/**
 * Finance API Client
 * Following Clean Architecture - Infrastructure layer
 * Handles all HTTP communication with backend
 */

import { createApiClient } from '$lib/server/api';
import type {
	Transaction,
	FinanceSummary,
	CreateTransactionDTO,
	UpdateTransactionDTO,
	UpdateTransactionStatusDTO,
	TransactionFilters
} from '$lib/api/types/finance.types';

export class FinanceApiClient {
	private client;

	constructor(token?: string) {
		this.client = createApiClient(token);
	}

	/**
	 * Create a new transaction
	 */
	async create(data: CreateTransactionDTO): Promise<Transaction> {
		return await this.client.post<Transaction>('/transactions', data);
	}

	/**
	 * Get transaction by ID
	 */
	async getById(id: string): Promise<Transaction> {
		return await this.client.get<Transaction>(`/transactions/${id}`);
	}

	/**
	 * List transactions with optional filters
	 */
	async list(filters?: TransactionFilters): Promise<Transaction[]> {
		const params = new URLSearchParams();

		if (filters?.division_id) {
			params.append('division_id', filters.division_id);
		}
		if (filters?.type) {
			params.append('type', filters.type);
		}
		if (filters?.status) {
			params.append('status', filters.status);
		}
		if (filters?.start_date) {
			params.append('start_date', filters.start_date);
		}
		if (filters?.end_date) {
			params.append('end_date', filters.end_date);
		}

		const query = params.toString();
		const endpoint = query ? `/transactions?${query}` : '/transactions';

		return await this.client.get<Transaction[]>(endpoint);
	}

	/**
	 * Update transaction
	 */
	async update(id: string, data: UpdateTransactionDTO): Promise<Transaction> {
		return await this.client.put<Transaction>(`/transactions/${id}`, data);
	}

	/**
	 * Update transaction status (approve/reject)
	 */
	async updateStatus(id: string, data: UpdateTransactionStatusDTO): Promise<Transaction> {
		return await this.client.patch<Transaction>(`/transactions/${id}/status`, data);
	}

	/**
	 * Delete transaction
	 */
	async delete(id: string): Promise<void> {
		await this.client.delete<void>(`/transactions/${id}`);
	}

	/**
	 * Get financial summary
	 */
	async getSummary(divisionId?: string): Promise<FinanceSummary> {
		const params = new URLSearchParams();
		if (divisionId) {
			params.append('division_id', divisionId);
		}

		const query = params.toString();
		const endpoint = query ? `/finance/summary?${query}` : '/finance/summary';

		return await this.client.get<FinanceSummary>(endpoint);
	}
}

/**
 * Factory function to create finance API client
 */
export function createFinanceApiClient(token?: string): FinanceApiClient {
	return new FinanceApiClient(token);
}
