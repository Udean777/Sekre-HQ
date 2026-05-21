// Backend response shapes (snake_case)
import type { TaskStatus, TaskPriority } from '@core/domain/entities/Task';

export interface TaskAssigneeDTO {
  id: string;
  email: string;
  full_name: string;
  must_reset_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskDTO {
  id: string;
  organization_id: string;
  division_id: string | null;
  assignee_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskItemDTO {
  task: TaskDTO;
  assignee: TaskAssigneeDTO | null;
}

export interface TaskListResponseDTO {
  success: boolean;
  message: string;
  data: {
    data: TaskItemDTO[];
    pagination: {
      page: number;
      page_size: number;
      total_items: number;
      total_pages: number;
    };
  };
}

export interface TaskResponseDTO {
  success: boolean;
  message: string;
  data: TaskItemDTO;
}

// Request shapes
export interface CreateTaskRequestDTO {
  title: string;
  description?: string;
  priority?: TaskPriority;
  assignee_id?: string;
  division_id?: string;
  due_date?: string;
}

export interface UpdateTaskRequestDTO {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  assignee_id?: string | null;
  division_id?: string;
  due_date?: string;
}

export interface UpdateTaskStatusRequestDTO {
  status: TaskStatus;
}
