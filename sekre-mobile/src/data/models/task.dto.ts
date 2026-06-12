import { TaskEntity } from '@/domain/entities/task.entity';

export interface TaskFilters {
  division_id?: string;
  assignee_id?: string;
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total_items: number;
    total_pages: number;
    page: number;
    page_size: number;
  };
}
