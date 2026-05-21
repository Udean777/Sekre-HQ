// Backend response shapes (snake_case)
import type { TaskStatus, TaskPriority } from '@core/domain/entities/Task';

export interface TaskDTO {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  assignee_name: string | null;
  division_id: string | null;
  division_name: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskListResponseDTO {
  tasks: TaskDTO[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Request shapes
export interface CreateTaskRequestDTO {
  title: string;
  description?: string;
  priority: TaskPriority;
  assignee_id?: string;
  division_id?: string;
  due_date?: string;
}

export interface UpdateTaskRequestDTO {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  assignee_id?: string;
  division_id?: string;
  due_date?: string;
}

export interface UpdateTaskStatusRequestDTO {
  status: TaskStatus;
}
