/**
 * Task Domain Types
 * Following Clean Architecture principles - Domain entities
 */

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
	id: string;
	organization_id: string;
	division_id: string;
	assignee_id: string | null;
	title: string;
	description: string;
	status: TaskStatus;
	due_date: string | null;
	created_at: string;
	updated_at: string;
}

export interface TaskAssignee {
	id: string;
	email: string;
	full_name: string;
	created_at: string;
	updated_at: string;
}

export interface TaskWithAssignee {
	task: Task;
	assignee: TaskAssignee | null;
}

// DTOs (Data Transfer Objects)
export interface CreateTaskDTO {
	division_id: string;
	assignee_id?: string | null;
	title: string;
	description: string;
	due_date?: string | null;
}

export interface UpdateTaskDTO {
	title: string;
	description: string;
	assignee_id?: string | null;
	due_date?: string | null;
	status: TaskStatus;
}

export interface UpdateTaskStatusDTO {
	status: TaskStatus;
}

// Query filters
export interface TaskFilters {
	division_id?: string;
	assignee_id?: string;
	status?: TaskStatus;
}

// View Models (for UI)
export interface TaskViewModel extends TaskWithAssignee {
	isOverdue: boolean;
	isDueSoon: boolean;
	statusColor: string;
	statusLabel: string;
}
