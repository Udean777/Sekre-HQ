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
  priority: TaskPriority;
  assigneeId?: string;
  divisionId?: string;
  dueDate?: string; // ISO string
}

export interface UpdateTaskParams {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  assigneeId?: string;
  divisionId?: string;
  dueDate?: string; // ISO string
}

export interface ITaskRepository {
  getTasks(filter?: TaskFilter): Promise<TaskListResult>;
  getTaskById(id: TaskId): Promise<Task>;
  createTask(params: CreateTaskParams): Promise<Task>;
  updateTask(id: TaskId, params: UpdateTaskParams): Promise<Task>;
  updateTaskStatus(id: TaskId, status: TaskStatus): Promise<Task>;
  deleteTask(id: TaskId): Promise<void>;
}
