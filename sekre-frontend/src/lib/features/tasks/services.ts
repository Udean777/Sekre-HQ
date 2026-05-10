import { apiClient } from '$lib/core/api';
import type { TaskWithAssignee, CreateTaskRequest, UpdateTaskRequest } from './types';

export const taskService = {
	async create(data: CreateTaskRequest): Promise<TaskWithAssignee> {
		const response = await apiClient('/tasks', {
			method: 'POST',
			body: JSON.stringify(data)
		});
		return response.data;
	},

	async list(filters?: {
		division_id?: string;
		assignee_id?: string;
		status?: string;
	}): Promise<TaskWithAssignee[]> {
		const params = new URLSearchParams();
		if (filters?.division_id) params.append('division_id', filters.division_id);
		if (filters?.assignee_id) params.append('assignee_id', filters.assignee_id);
		if (filters?.status) params.append('status', filters.status);

		const query = params.toString();
		const response = await apiClient(`/tasks${query ? `?${query}` : ''}`, {
			method: 'GET'
		});
		return response.data;
	},

	async getById(id: string): Promise<TaskWithAssignee> {
		const response = await apiClient(`/tasks/${id}`, {
			method: 'GET'
		});
		return response.data;
	},

	async update(id: string, data: UpdateTaskRequest): Promise<TaskWithAssignee> {
		const response = await apiClient(`/tasks/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data)
		});
		return response.data;
	},

	async updateStatus(id: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE'): Promise<void> {
		await apiClient(`/tasks/${id}/status`, {
			method: 'PATCH',
			body: JSON.stringify({ status })
		});
	},

	async delete(id: string): Promise<void> {
		await apiClient(`/tasks/${id}`, {
			method: 'DELETE'
		});
	}
};
