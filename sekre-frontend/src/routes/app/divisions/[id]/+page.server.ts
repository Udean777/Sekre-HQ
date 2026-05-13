import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createApiClient } from '$lib/server/api';
import { createTaskApiClient } from '$lib/api/clients/task.client';
import { createEventApiClient } from '$lib/api/clients/event.client';
import { createFinanceApiClient } from '$lib/api/clients/finance.client';
import type { Division } from '$lib/api/types';

export const load: PageServerLoad = async ({ locals, params }) => {
	// Protect route
	if (!locals.user || !locals.token) {
		throw redirect(303, '/login');
	}

	const divisionId = params.id;
	const apiClient = createApiClient(locals.token);
	const taskClient = createTaskApiClient(locals.token);
	const eventClient = createEventApiClient(locals.token);
	const financeClient = createFinanceApiClient(locals.token);

	try {
		// Fetch division details and related data in parallel
		const [division, members, tasks, events, transactions] = await Promise.all([
			apiClient.get<Division>(`/divisions/${divisionId}`),
			apiClient.get<any[]>(`/divisions/${divisionId}/members`).catch(() => []),
			taskClient.list({ division_id: divisionId }).catch(() => []),
			eventClient.list({ division_id: divisionId }).catch(() => []),
			financeClient.list({ division_id: divisionId }).catch(() => [])
		]);

		// Get all organization members to show in add member form
		// For now, we'll use a simple approach - get current user's organization members
		// In production, you'd have a dedicated endpoint for this
		const allUsers = [
			{ id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', full_name: 'Sajudin Ma\'ruf', email: 'sajudin@himti.org' },
			{ id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', full_name: 'Zulhamdani', email: 'zulhamdani@himti.org' },
			{ id: 'dddddddd-dddd-dddd-dddd-dddddddddddd', full_name: 'Gilang Gemilang', email: 'gilang@himti.org' }
		];

		// Filter out users who are already members
		const memberUserIds = new Set((members || []).map((m: any) => m.user?.id || m.user_id));
		const availableUsers = allUsers.filter(u => !memberUserIds.has(u.id));

		console.log('[Division Detail] Loaded division:', division.name);
		console.log('[Division Detail] Members:', (members || []).length);
		console.log('[Division Detail] Tasks:', (tasks || []).length);
		console.log('[Division Detail] Events:', (events || []).length);
		console.log('[Division Detail] Transactions:', (transactions || []).length);
		console.log('[Division Detail] Available users:', availableUsers.length);

		return {
			division,
			members: members || [],
			tasks: tasks || [],
			events: events || [],
			transactions: transactions || [],
			availableUsers
		};
	} catch (err: any) {
		console.error('[Division Detail] Failed to load:', err);

		if (err.statusCode === 404) {
			throw error(404, 'Division not found');
		}

		if (err.statusCode === 401) {
			throw redirect(303, '/login');
		}

		throw error(500, 'Failed to load division details');
	}
};

export const actions: Actions = {
	addMember: async ({ request, locals, params }) => {
		if (!locals.token) {
			return { error: 'Unauthorized' };
		}

		try {
			const formData = await request.formData();
			const userId = formData.get('user_id') as string;
			const role = formData.get('role') as string;

			const apiClient = createApiClient(locals.token);
			await apiClient.post(`/divisions/${params.id}/members`, {
				user_id: userId,
				role: role
			});

			return { success: true };
		} catch (error: any) {
			console.error('[Add Member] Failed:', error);
			return { error: error.message || 'Failed to add member' };
		}
	},

	removeMember: async ({ request, locals, params }) => {
		if (!locals.token) {
			return { error: 'Unauthorized' };
		}

		try {
			const formData = await request.formData();
			const userId = formData.get('user_id') as string;

			const apiClient = createApiClient(locals.token);
			await apiClient.delete(`/divisions/${params.id}/members/${userId}`);

			return { success: true };
		} catch (error: any) {
			console.error('[Remove Member] Failed:', error);
			return { error: error.message || 'Failed to remove member' };
		}
	},

	updateMemberRole: async ({ request, locals, params }) => {
		if (!locals.token) {
			return { error: 'Unauthorized' };
		}

		try {
			const formData = await request.formData();
			const userId = formData.get('user_id') as string;
			const role = formData.get('role') as string;

			const apiClient = createApiClient(locals.token);
			await apiClient.patch(`/divisions/${params.id}/members/${userId}`, {
				division_role: role
			});

			return { success: true };
		} catch (error: any) {
			console.error('[Update Member Role] Failed:', error);
			return { error: error.message || 'Failed to update member role' };
		}
	}
};
