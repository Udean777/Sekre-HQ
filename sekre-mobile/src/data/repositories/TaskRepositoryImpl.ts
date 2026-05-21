import type { AxiosInstance } from 'axios';
import type {
  ITaskRepository,
  CreateTaskParams,
  UpdateTaskParams,
} from '@core/ports/ITaskRepository';
import type {
  Task,
  TaskId,
  TaskFilter,
  TaskListResult,
  TaskStatus,
} from '@core/domain/entities/Task';
import { ENDPOINTS } from '@data/http/endpoints';
import type {
  TaskDTO,
  TaskListResponseDTO,
  CreateTaskRequestDTO,
  UpdateTaskRequestDTO,
  UpdateTaskStatusRequestDTO,
} from '@data/dto/task.dto';
import { mapTaskDTOToEntity, mapTaskListDTOToResult } from '@data/mappers/task.mapper';

export class TaskRepositoryImpl implements ITaskRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getTasks(filter?: TaskFilter): Promise<TaskListResult> {
    const params: Record<string, string | number> = {};
    if (filter?.status) params.status = filter.status;
    if (filter?.priority) params.priority = filter.priority;
    if (filter?.assigneeId) params.assignee_id = filter.assigneeId;
    if (filter?.divisionId) params.division_id = filter.divisionId;
    if (filter?.search) params.search = filter.search;
    if (filter?.page) params.page = filter.page;
    if (filter?.limit) params.limit = filter.limit;

    const { data } = await this.http.get<TaskListResponseDTO>(ENDPOINTS.TASKS.LIST, { params });
    return mapTaskListDTOToResult(data);
  }

  async getTaskById(id: TaskId): Promise<Task> {
    const { data } = await this.http.get<TaskDTO>(ENDPOINTS.TASKS.DETAIL(id));
    return mapTaskDTOToEntity(data);
  }

  async createTask(params: CreateTaskParams): Promise<Task> {
    const payload: CreateTaskRequestDTO = {
      title: params.title,
      priority: params.priority,
      ...(params.description !== undefined && { description: params.description }),
      ...(params.assigneeId !== undefined && { assignee_id: params.assigneeId }),
      ...(params.divisionId !== undefined && { division_id: params.divisionId }),
      ...(params.dueDate !== undefined && { due_date: params.dueDate }),
    };
    const { data } = await this.http.post<TaskDTO>(ENDPOINTS.TASKS.CREATE, payload);
    return mapTaskDTOToEntity(data);
  }

  async updateTask(id: TaskId, params: UpdateTaskParams): Promise<Task> {
    const payload: UpdateTaskRequestDTO = {
      ...(params.title !== undefined && { title: params.title }),
      ...(params.description !== undefined && { description: params.description }),
      ...(params.priority !== undefined && { priority: params.priority }),
      ...(params.assigneeId !== undefined && { assignee_id: params.assigneeId }),
      ...(params.divisionId !== undefined && { division_id: params.divisionId }),
      ...(params.dueDate !== undefined && { due_date: params.dueDate }),
    };
    const { data } = await this.http.put<TaskDTO>(ENDPOINTS.TASKS.UPDATE(id), payload);
    return mapTaskDTOToEntity(data);
  }

  async updateTaskStatus(id: TaskId, status: TaskStatus): Promise<Task> {
    const payload: UpdateTaskStatusRequestDTO = { status };
    const { data } = await this.http.patch<TaskDTO>(ENDPOINTS.TASKS.UPDATE_STATUS(id), payload);
    return mapTaskDTOToEntity(data);
  }

  async deleteTask(id: TaskId): Promise<void> {
    await this.http.delete(ENDPOINTS.TASKS.DELETE(id));
  }
}
