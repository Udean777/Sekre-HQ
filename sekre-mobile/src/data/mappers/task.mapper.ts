import type { Task, TaskId, TaskPage } from '@core/domain/entities/Task';
import type { TaskItemDTO, TaskListResponseDTO, TaskResponseDTO } from '@data/dto/task.dto';
import { mapPaginationMeta } from './pagination.mapper';

export const mapTaskItemDTOToEntity = (dto: TaskItemDTO): Task => ({
  id: dto.task.id as TaskId,
  title: dto.task.title,
  description: dto.task.description,
  status: dto.task.status,
  priority: 'MEDIUM', // backend tidak return priority, default MEDIUM
  assigneeId: dto.task.assignee_id,
  assigneeName: dto.assignee?.full_name ?? null,
  divisionId: dto.task.division_id,
  divisionName: null, // backend tidak return division_name di list
  dueDate: dto.task.due_date ? new Date(dto.task.due_date) : null,
  createdAt: new Date(dto.task.created_at),
  updatedAt: new Date(dto.task.updated_at),
});

export const mapTaskListDTOToPage = (dto: TaskListResponseDTO): TaskPage => ({
  items: dto.data.data.map(mapTaskItemDTOToEntity),
  meta: mapPaginationMeta(dto.data.pagination),
});

export const mapTaskResponseDTOToEntity = (dto: TaskResponseDTO): Task =>
  mapTaskItemDTOToEntity(dto.data);

// Keep for backward compat if needed elsewhere
export const mapTaskDTOToEntity = mapTaskItemDTOToEntity;
