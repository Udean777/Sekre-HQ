import { TaskEntity } from '../entities/task.entity';
import { PaginatedResponse, TaskFilters } from '@/data/models/task.dto';

export interface TaskRepository {
  listTasks(filters?: TaskFilters): Promise<PaginatedResponse<TaskEntity>>;
}
