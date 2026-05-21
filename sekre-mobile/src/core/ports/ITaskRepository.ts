import type {
  Task,
  TaskId,
  TaskFilter,
  TaskListResult,
  TaskStatus,
  TaskPriority,
} from '@core/domain/entities/Task';

export interface CreateTaskParams {
  title: string;
  description?: string;
  divisionId: string;
  assigneeId?: string;
  dueDate?: string; // RFC3339
}

export interface UpdateTaskParams {
  title?: string;
  description?: string;
  assigneeId?: string | null;
  dueDate?: string; // RFC3339
}

export interface ITaskRepository {
  getTasks(filter?: TaskFilter): Promise<TaskListResult>;
  getTaskById(id: TaskId): Promise<Task>;
  createTask(params: CreateTaskParams): Promise<Task>;
  updateTask(id: TaskId, params: UpdateTaskParams): Promise<Task>;
  updateTaskStatus(id: TaskId, status: TaskStatus): Promise<Task>;
  deleteTask(id: TaskId): Promise<void>;
}
