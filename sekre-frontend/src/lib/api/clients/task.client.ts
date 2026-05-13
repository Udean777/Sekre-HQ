/**
 * Task API Client
 * Following Clean Architecture - Infrastructure layer
 * Handles all HTTP communication with backend
 */

import { createApiClient } from '$lib/server/api';
import type {
	TaskWithAssignee,
	CreateTaskDTO,
	UpdateTaskDTO,
	UpdateTaskStatusDTO,
	TaskFilters
} from '$lib/api/types/task.types';

export class TaskApiClient {
	private client;

	constructor(token?: string) {
		this.client = createApiClient(token);
	}

	/**
	 * Create a new task
	 */
	async create(data: CreateTaskDTO): Promise<TaskWithAssignee> {
		return await this.client.post<TaskWithAssignee>('/tasks', data);
	}

	/**
	 * Get task by ID
	 */
	async getById(id: string): Promise<TaskWithAssignee> {
		return await this.client.get<TaskWithAssignee>(`/tasks/${id}`);
	}

	/**
	 * List tasks with optional filters
	 */
	async list(filters?: TaskFilters): Promise<TaskWithAssignee[]> {
		const params = new URLSearchParams();

		if (filters?.division_id) {
			params.append('division_id', filters.division_id);
		}
		if (filters?.assignee_id) {
			params.append('assignee_id', filters.assignee_id);
		}
		if (filters?.status) {
			params.append('status', filters.status);
		}

		const query = params.toString();
		const endpoint = query ? `/tasks?${query}` : '/tasks';

		return await this.client.get<TaskWithAssignee[]>(endpoint);
	}

	/**
	 * Update task
	 */
	async update(id: string, data: UpdateTaskDTO): Promise<TaskWithAssignee> {
		return await this.client.put<TaskWithAssignee>(`/tasks/${id}`, data);
	}

	/**
	 * Update task status only
	 */
	async updateStatus(id: string, data: UpdateTaskStatusDTO): Promise<void> {
		await this.client.patch<void>(`/tasks/${id}/status`, data);
	}

	/**
	 * Delete task
	 */
	async delete(id: string): Promise<void> {
		await this.client.delete<void>(`/tasks/${id}`);
	}
}

/**
 * Factory function to create task API client
 */
export function createTaskApiClient(token?: string): TaskApiClient {
	return new TaskApiClient(token);
}
