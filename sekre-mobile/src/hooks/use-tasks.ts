import { useQuery } from '@tanstack/react-query';
import { taskRepository } from '@/data/repositories/task.repository.impl';
import { TaskFilters } from '@/data/models/task.dto';
import { useAuthStore } from '@/core/store/use-auth-store';

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
};

export const useTasks = (filters: TaskFilters = {}) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => taskRepository.listTasks(filters),
    enabled: isAuthenticated,
  });
};
