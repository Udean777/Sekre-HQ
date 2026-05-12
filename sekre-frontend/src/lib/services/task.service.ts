/**
 * Task Service
 * Following Clean Architecture - Application layer
 * Contains business logic and data transformation
 */

import type {
	TaskWithAssignee,
	TaskViewModel,
	TaskStatus
} from '$lib/api/types/task.types';

/**
 * Transform task to view model with computed properties
 */
export function toTaskViewModel(task: TaskWithAssignee): TaskViewModel {
	const now = new Date();
	const dueDate = task.task.due_date ? new Date(task.task.due_date) : null;

	// Check if overdue
	const isOverdue = dueDate ? dueDate < now && task.task.status !== 'DONE' : false;

	// Check if due soon (within 3 days)
	const isDueSoon = dueDate
		? dueDate > now &&
		  dueDate.getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000 &&
		  task.task.status !== 'DONE'
		: false;

	return {
		...task,
		isOverdue,
		isDueSoon,
		statusColor: getStatusColor(task.task.status),
		statusLabel: getStatusLabel(task.task.status)
	};
}

/**
 * Get color for task status
 */
export function getStatusColor(status: TaskStatus): string {
	switch (status) {
		case 'TODO':
			return 'gray';
		case 'IN_PROGRESS':
			return 'blue';
		case 'DONE':
			return 'green';
		default:
			return 'gray';
	}
}

/**
 * Get label for task status
 */
export function getStatusLabel(status: TaskStatus): string {
	switch (status) {
		case 'TODO':
			return 'To Do';
		case 'IN_PROGRESS':
			return 'In Progress';
		case 'DONE':
			return 'Done';
		default:
			return status;
	}
}

/**
 * Format due date for display
 */
export function formatDueDate(dueDate: string | null): string {
	if (!dueDate) return 'No due date';

	const date = new Date(dueDate);
	const now = new Date();
	const diffTime = date.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays < 0) {
		return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
	} else if (diffDays === 0) {
		return 'Due today';
	} else if (diffDays === 1) {
		return 'Due tomorrow';
	} else if (diffDays <= 7) {
		return `Due in ${diffDays} days`;
	} else {
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
		});
	}
}

/**
 * Validate task form data
 */
export function validateTaskForm(data: {
	title: string;
	description: string;
	division_id: string;
}): { valid: boolean; errors: Record<string, string> } {
	const errors: Record<string, string> = {};

	if (!data.title.trim()) {
		errors.title = 'Title is required';
	} else if (data.title.length > 500) {
		errors.title = 'Title must be less than 500 characters';
	}

	if (!data.division_id) {
		errors.division_id = 'Division is required';
	}

	return {
		valid: Object.keys(errors).length === 0,
		errors
	};
}

/**
 * Group tasks by status
 */
export function groupTasksByStatus(
	tasks: TaskWithAssignee[]
): Record<TaskStatus, TaskWithAssignee[]> {
	return {
		TODO: tasks.filter((t) => t.task.status === 'TODO'),
		IN_PROGRESS: tasks.filter((t) => t.task.status === 'IN_PROGRESS'),
		DONE: tasks.filter((t) => t.task.status === 'DONE')
	};
}

/**
 * Sort tasks by due date (earliest first, null last)
 */
export function sortTasksByDueDate(tasks: TaskWithAssignee[]): TaskWithAssignee[] {
	return [...tasks].sort((a, b) => {
		if (!a.task.due_date) return 1;
		if (!b.task.due_date) return -1;
		return new Date(a.task.due_date).getTime() - new Date(b.task.due_date).getTime();
	});
}
