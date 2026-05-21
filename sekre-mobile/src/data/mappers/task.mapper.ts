import type { Task, TaskId, TaskListResult } from '@core/domain/entities/Task';
import type { TaskDTO, TaskListResponseDTO } from '@data/dto/task.dto';

export const mapTaskDTOToEntity = (dto: TaskDTO): Task => ({
  id: dto.id as TaskId,
  title: dto.title,
  description: dto.description,
  status: dto.status,
  priority: dto.priority,
  assigneeId: dto.assignee_id,
  assigneeName: dto.assignee_name,
  divisionId: dto.division_id,
  divisionName: dto.division_name,
  dueDate: dto.due_date ? new Date(dto.due_date) : null,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
});

export const mapTaskListDTOToResult = (dto: TaskListResponseDTO): TaskListResult => ({
  tasks: dto.tasks.map(mapTaskDTOToEntity),
  total: dto.total,
  page: dto.page,
  limit: dto.limit,
  totalPages: dto.total_pages,
});
