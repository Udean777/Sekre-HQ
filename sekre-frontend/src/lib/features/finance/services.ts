import { apiClient } from '$lib/core/api';
import type { Transaction, FinanceSummary, CreateTransactionRequest, UpdateTransactionRequest } from './types';

export const financeService = {
	async createTransaction(data: CreateTransactionRequest): Promise<Transaction> {
		const response = await apiClient('/transactions', {
			method: 'POST',
			body: JSON.stringify(data)
		});
		return response.data;
	},

	async listTransactions(filters?: {
		division_id?: string;
		type?: string;
		start_date?: string;
		end_date?: string;
	}): Promise<Transaction[]> {
		const params = new URLSearchParams();
		if (filters?.division_id) params.append('division_id', filters.division_id);
		if (filters?.type) params.append('type', filters.type);
		if (filters?.start_date) params.append('start_date', filters.start_date);
		if (filters?.end_date) params.append('end_date', filters.end_date);

		const query = params.toString();
		const response = await apiClient(`/transactions${query ? `?${query}` : ''}`, {
			method: 'GET'
		});
		return response.data;
	},

	async getTransaction(id: string): Promise<Transaction> {
		const response = await apiClient(`/transactions/${id}`, {
			method: 'GET'
		});
		return response.data;
	},

	async updateTransaction(id: string, data: UpdateTransactionRequest): Promise<Transaction> {
		const response = await apiClient(`/transactions/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data)
		});
		return response.data;
	},

	async deleteTransaction(id: string): Promise<void> {
		await apiClient(`/transactions/${id}`, {
			method: 'DELETE'
		});
	},

	async getSummary(divisionId?: string): Promise<FinanceSummary> {
		const params = new URLSearchParams();
		if (divisionId) params.append('division_id', divisionId);

		const query = params.toString();
		const response = await apiClient(`/finance/summary${query ? `?${query}` : ''}`, {
			method: 'GET'
		});
		return response.data;
	}
};
