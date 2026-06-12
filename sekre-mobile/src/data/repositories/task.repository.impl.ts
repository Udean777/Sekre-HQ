import { TaskRepository } from '@/domain/repositories/task.repository';
import { TaskEntity } from '@/domain/entities/task.entity';
import { PaginatedResponse, TaskFilters } from '../models/task.dto';
import { apiClient } from '@/core/network/api-client';
import { ENDPOINTS } from '@/core/config/api';

class TaskRepositoryImpl implements TaskRepository {
  async listTasks(filters?: TaskFilters): Promise<PaginatedResponse<TaskEntity>> {
    // Bersihkan filter dari undefined agar query string rapi
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status) params.append('status', filters.status);
      if (filters.assignee_id) params.append('assignee_id', filters.assignee_id);
      if (filters.division_id) params.append('division_id', filters.division_id);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.page_size) params.append('page_size', filters.page_size.toString());
    }

    const { data } = await apiClient.get<{ data: PaginatedResponse<TaskEntity> }>(
      `${ENDPOINTS.TASKS.BASE}?${params.toString()}`
    );

    return data.data;
  }
}

export const taskRepository = new TaskRepositoryImpl();
