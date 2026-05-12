import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createFinanceApiClient } from '$lib/api/clients/finance.client';
import { createApiClient } from '$lib/server/api';
import type { Division } from '$lib/api/types';
import type { CreateTransactionDTO, UpdateTransactionDTO } from '$lib/api/types/finance.types';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Protect route
	if (!locals.user || !locals.token) {
		throw redirect(303, '/login');
	}

	const financeClient = createFinanceApiClient(locals.token);
	const apiClient = createApiClient(locals.token);

	// Get filter params
	const divisionId = url.searchParams.get('division_id') || undefined;
	const type = url.searchParams.get('type') || undefined;
	const status = url.searchParams.get('status') || undefined;

	try {
		// Fetch transactions with filters
		const transactions = await financeClient.list({
			division_id: divisionId,
			type: type as any,
			status: status as any
		});

		// Fetch divisions for filter
		const divisions = await apiClient.get<Division[]>('/divisions');

		// Fetch financial summary
		const summary = await financeClient.getSummary(divisionId);

		console.log('[Finance Page] Loaded transactions count:', transactions?.length || 0);
		console.log('[Finance Page] Summary:', summary);

		return {
			transactions: transactions || [],
			divisions: divisions || [],
			summary,
			filters: {
				division_id: divisionId,
				type,
				status
			}
		};
	} catch (error: any) {
		console.error('[Finance Page] Failed to load data:', error);
		console.error('[Finance Page] Error details:', error.message);

		// If token is invalid, redirect to login
		if (error.statusCode === 401) {
			throw redirect(303, '/login');
		}

		return {
			transactions: [],
			divisions: [],
			summary: { total_income: 0, total_expense: 0, balance: 0 },
			filters: {},
			error: 'Failed to load financial data. Please refresh the page.'
		};
	}
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.token) {
			console.error('[Create Transaction] No token found');
			return { error: 'Unauthorized' };
		}

		try {
			const formData = await request.formData();

			const data: CreateTransactionDTO = {
				type: formData.get('type') as any,
				amount: parseFloat(formData.get('amount') as string),
				description: formData.get('description') as string,
				division_id: formData.get('division_id') as string,
				receipt_url: (formData.get('receipt_url') as string) || null
			};

			console.log('[Create Transaction] Creating transaction:', data);

			const financeClient = createFinanceApiClient(locals.token);
			const result = await financeClient.create(data);

			console.log('[Create Transaction] Transaction created successfully:', result);

			return { success: true };
		} catch (error: any) {
			console.error('[Create Transaction] Failed:', error);
			console.error('[Create Transaction] Error message:', error.message);
			return { error: error.message || 'Failed to create transaction' };
		}
	},

	update: async ({ request, locals }) => {
		if (!locals.token) {
			return { error: 'Unauthorized' };
		}

		try {
			const formData = await request.formData();
			const transactionId = formData.get('transaction_id') as string;

			const data: UpdateTransactionDTO = {
				type: formData.get('type') as any,
				amount: parseFloat(formData.get('amount') as string),
				description: formData.get('description') as string,
				receipt_url: (formData.get('receipt_url') as string) || null
			};

			const financeClient = createFinanceApiClient(locals.token);
			await financeClient.update(transactionId, data);

			return { success: true };
		} catch (error: any) {
			console.error('[Update Transaction] Failed:', error);
			console.error('[Update Transaction] Error message:', error.message);
			return { error: error.message || 'Failed to update transaction' };
		}
	},

	delete: async ({ request, locals }) => {
		if (!locals.token) {
			return { error: 'Unauthorized' };
		}

		try {
			const formData = await request.formData();
			const transactionId = formData.get('transaction_id') as string;

			const financeClient = createFinanceApiClient(locals.token);
			await financeClient.delete(transactionId);

			return { success: true };
		} catch (error: any) {
			console.error('[Delete Transaction] Failed:', error);
			console.error('[Delete Transaction] Error message:', error.message);
			return { error: error.message || 'Failed to delete transaction' };
		}
	}
};
