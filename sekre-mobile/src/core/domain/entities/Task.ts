// Branded types untuk type safety
export type TaskId = string & { __brand: 'TaskId' };

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: TaskId;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  assigneeName: string | null;
  divisionId: string | null;
  divisionName: string | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  divisionId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TaskListResult {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
