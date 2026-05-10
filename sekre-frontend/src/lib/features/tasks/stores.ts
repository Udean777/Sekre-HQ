import { writable } from 'svelte/store';
import type { TaskWithAssignee } from './types';

function createTasksStore() {
	const { subscribe, set, update } = writable<TaskWithAssignee[]>([]);

	return {
		subscribe,
		set,
		add(task: TaskWithAssignee) {
			update(tasks => [task, ...tasks]);
		},
		remove(id: string) {
			update(tasks => tasks.filter(t => t.task.id !== id));
		},
		updateOne(id: string, data: Partial<TaskWithAssignee>) {
			update(tasks =>
				tasks.map(t => (t.task.id === id ? { ...t, ...data } : t))
			);
		},
		updateStatus(id: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') {
			update(tasks =>
				tasks.map(t =>
					t.task.id === id ? { ...t, task: { ...t.task, status } } : t
				)
			);
		}
	};
}

export const tasksStore = createTasksStore();
