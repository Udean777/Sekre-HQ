import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createTaskApiClient } from '$lib/api/clients/task.client';
import { createApiClient } from '$lib/server/api';
import type { Division } from '$lib/api/types';
import type { CreateTaskDTO, UpdateTaskDTO } from '$lib/api/types/task.types';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Protect route
	if (!locals.user || !locals.token) {
		throw redirect(303, '/login');
	}

	const taskClient = createTaskApiClient(locals.token);
	const apiClient = createApiClient(locals.token);

	// Get filter params
	const divisionId = url.searchParams.get('division_id') || undefined;
	const assigneeId = url.searchParams.get('assignee_id') || undefined;
	const status = url.searchParams.get('status') || undefined;

	try {
		// Fetch tasks with filters
		const tasks = await taskClient.list({
			division_id: divisionId,
			assignee_id: assigneeId,
			status: status as any
		});

		// Fetch divisions for filter
		const divisions = await apiClient.get<Division[]>('/divisions');

		console.log('[Tasks Page] Loaded tasks count:', tasks?.length || 0);
		console.log('[Tasks Page] Loaded divisions count:', divisions?.length || 0);
		console.log('[Tasks Page] First task:', tasks?.[0] ? JSON.stringify(tasks[0]) : 'none');

		return {
			tasks: tasks || [],
			divisions: divisions || [],
			filters: {
				division_id: divisionId,
				assignee_id: assigneeId,
				status
			}
		};
	} catch (error: any) {
		console.error('[Tasks Page] Failed to load tasks:', error);
		console.error('[Tasks Page] Error details:', error.message);
		console.error('[Tasks Page] Error stack:', error.stack);
		
		// If token is invalid, redirect to login
		if (error.statusCode === 401) {
			throw redirect(303, '/login');
		}
		
		return {
			tasks: [],
			divisions: [],
			filters: {},
			error: 'Failed to load tasks. Please refresh the page.'
		};
	}
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.token) {
			console.error('[Create Task] No token found');
			return { error: 'Unauthorized' };
		}

		try {
			const formData = await request.formData();

			const dueDateStr = formData.get('due_date') as string;
			const assigneeIdStr = formData.get('assignee_id') as string;

			const data: CreateTaskDTO = {
				title: formData.get('title') as string,
				description: formData.get('description') as string,
				division_id: formData.get('division_id') as string,
				assignee_id: assigneeIdStr && assigneeIdStr !== '' ? assigneeIdStr : null,
				due_date: dueDateStr && dueDateStr !== '' ? new Date(dueDateStr).toISOString() : null
			};

			console.log('[Create Task] Creating task:', data);

			const taskClient = createTaskApiClient(locals.token);
			const result = await taskClient.create(data);

			console.log('[Create Task] Task created successfully:', result);

			return { success: true };
		} catch (error: any) {
			console.error('[Create Task] Failed to create task:', error);
			console.error('[Create Task] Error message:', error.message);
			return { error: error.message || 'Failed to create task' };
		}
	},

	update: async ({ request, locals }) => {
		if (!locals.token) {
			return { error: 'Unauthorized' };
		}

		try {
			const formData = await request.formData();
			const taskId = formData.get('task_id') as string;

			const dueDateStr = formData.get('due_date') as string;
			const assigneeIdStr = formData.get('assignee_id') as string;

			const data: UpdateTaskDTO = {
				title: formData.get('title') as string,
				description: formData.get('description') as string,
				assignee_id: assigneeIdStr && assigneeIdStr !== '' ? assigneeIdStr : null,
				due_date: dueDateStr && dueDateStr !== '' ? new Date(dueDateStr).toISOString() : null,
				status: formData.get('status') as any
			};

			const taskClient = createTaskApiClient(locals.token);
			await taskClient.update(taskId, data);

			return { success: true };
		} catch (error: any) {
			console.error('Failed to update task:', error);
			return { error: error.message || 'Failed to update task' };
		}
	},

	delete: async ({ request, locals }) => {
		if (!locals.token) {
			return { error: 'Unauthorized' };
		}

		try {
			const formData = await request.formData();
			const taskId = formData.get('task_id') as string;

			const taskClient = createTaskApiClient(locals.token);
			await taskClient.delete(taskId);

			return { success: true };
		} catch (error: any) {
			console.error('Failed to delete task:', error);
			return { error: error.message || 'Failed to delete task' };
		}
	},

	updateStatus: async ({ request, locals }) => {
		if (!locals.token) {
			return { error: 'Unauthorized' };
		}

		try {
			const formData = await request.formData();
			const taskId = formData.get('task_id') as string;
			const status = formData.get('status') as any;

			const taskClient = createTaskApiClient(locals.token);
			await taskClient.updateStatus(taskId, { status });

			return { success: true };
		} catch (error: any) {
			console.error('Failed to update task status:', error);
			return { error: error.message || 'Failed to update task status' };
		}
	}
};
