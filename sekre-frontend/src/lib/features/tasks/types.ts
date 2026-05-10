import type { User } from '$lib/features/auth/types';

export interface Task {
	id: string;
	organization_id: string;
	division_id: string;
	assignee_id: string | null;
	title: string;
	description: string;
	status: 'TODO' | 'IN_PROGRESS' | 'DONE';
	due_date: string | null;
	created_at: string;
	updated_at: string;
}

export interface TaskWithAssignee {
	task: Task;
	assignee: User | null;
}

export interface CreateTaskRequest {
	division_id: string;
	assignee_id?: string;
	title: string;
	description?: string;
	due_date?: string;
}

export interface UpdateTaskRequest {
	title: string;
	description?: string;
	assignee_id?: string;
	due_date?: string;
	status: 'TODO' | 'IN_PROGRESS' | 'DONE';
}
