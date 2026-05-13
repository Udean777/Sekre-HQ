import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createTaskApiClient } from '$lib/api/clients/task.client';
import { createEventApiClient } from '$lib/api/clients/event.client';
import { createFinanceApiClient } from '$lib/api/clients/finance.client';
import { createApiClient } from '$lib/server/api';
import type { Division } from '$lib/api/types';
import type { DashboardStats } from '$lib/api/types/dashboard.types';

export const load: PageServerLoad = async ({ locals }) => {
	// Protect route
	if (!locals.user || !locals.token) {
		throw redirect(303, '/login');
	}

	const taskClient = createTaskApiClient(locals.token);
	const eventClient = createEventApiClient(locals.token);
	const financeClient = createFinanceApiClient(locals.token);
	const apiClient = createApiClient(locals.token);

	try {
		// Fetch all data in parallel
		const [divisions, tasks, events, financeSummary] = await Promise.all([
			apiClient.get<Division[]>('/divisions'),
			taskClient.list(),
			eventClient.list(),
			financeClient.getSummary()
		]);

		// Calculate stats
		const now = new Date();
		const activeTasks = tasks.filter((t) => t.task.status !== 'DONE');
		const upcomingEvents = events.filter((e) => new Date(e.start_time) > now);

		const stats: DashboardStats = {
			divisions_count: divisions.length,
			tasks_count: tasks.length,
			active_tasks_count: activeTasks.length,
			upcoming_events_count: upcomingEvents.length,
			total_income: financeSummary.total_income,
			total_expense: financeSummary.total_expense,
			balance: financeSummary.balance
		};

		console.log('[Dashboard] Stats:', stats);

		return {
			stats,
			divisions: divisions || [],
			recentTasks: tasks.slice(0, 5),
			recentEvents: events.slice(0, 5)
		};
	} catch (error: any) {
		console.error('[Dashboard] Failed to load data:', error);
		console.error('[Dashboard] Error details:', error.message);

		// If token is invalid, redirect to login
		if (error.statusCode === 401) {
			throw redirect(303, '/login');
		}

		return {
			stats: {
				divisions_count: 0,
				tasks_count: 0,
				active_tasks_count: 0,
				upcoming_events_count: 0,
				total_income: 0,
				total_expense: 0,
				balance: 0
			},
			divisions: [],
			recentTasks: [],
			recentEvents: [],
			error: 'Failed to load dashboard data. Please refresh the page.'
		};
	}
};
