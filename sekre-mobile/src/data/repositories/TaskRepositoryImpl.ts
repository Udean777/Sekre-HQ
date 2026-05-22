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
  TaskListResponseDTO,
  TaskResponseDTO,
  CreateTaskRequestDTO,
  UpdateTaskRequestDTO,
  UpdateTaskStatusRequestDTO,
} from '@data/dto/task.dto';
import { mapTaskListDTOToResult, mapTaskResponseDTOToEntity } from '@data/mappers/task.mapper';

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
    const { data } = await this.http.get<TaskResponseDTO>(ENDPOINTS.TASKS.DETAIL(id));
    return mapTaskResponseDTOToEntity(data);
  }

  async createTask(params: CreateTaskParams): Promise<Task> {
    const payload: CreateTaskRequestDTO = {
      title: params.title,
      division_id: params.divisionId,
      ...(params.description !== undefined && { description: params.description }),
      ...(params.assigneeId !== undefined && { assignee_id: params.assigneeId }),
      ...(params.dueDate !== undefined && { due_date: params.dueDate }),
    };
    const { data } = await this.http.post<TaskResponseDTO>(ENDPOINTS.TASKS.CREATE, payload);
    return mapTaskResponseDTOToEntity(data);
  }

  async updateTask(id: TaskId, params: UpdateTaskParams): Promise<Task> {
    const payload: UpdateTaskRequestDTO = {
      ...(params.title !== undefined && { title: params.title }),
      ...(params.description !== undefined && { description: params.description }),
      ...(params.status !== undefined && { status: params.status }),
      ...(params.assigneeId !== undefined && { assignee_id: params.assigneeId }),
      ...(params.dueDate !== undefined && { due_date: params.dueDate }),
    };
    const { data } = await this.http.put<TaskResponseDTO>(ENDPOINTS.TASKS.UPDATE(id), payload);
    return mapTaskResponseDTOToEntity(data);
  }

  async updateTaskStatus(id: TaskId, status: TaskStatus): Promise<Task> {
    const payload: UpdateTaskStatusRequestDTO = { status };
    await this.http.patch(ENDPOINTS.TASKS.UPDATE_STATUS(id), payload);
    // Backend returns only { success, message } — no task data.
    // Fetch the updated task to return the full entity.
    return this.getTaskById(id);
  }

  async deleteTask(id: TaskId): Promise<void> {
    await this.http.delete(ENDPOINTS.TASKS.DELETE(id));
  }
}
