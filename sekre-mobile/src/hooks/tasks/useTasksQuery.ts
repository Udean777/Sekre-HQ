import { useQuery } from '@tanstack/react-query';
import { GetTasksUseCase } from '@core/usecases/tasks/GetTasksUseCase';
import { getTaskRepository } from '@di/container';
import type { TaskFilter, TaskListResult } from '@core/domain/entities/Task';

export const TASKS_QUERY_KEY = 'tasks';

export const useTasksQuery = (filter?: TaskFilter) => {
  return useQuery<TaskListResult, Error>({
    queryKey: [TASKS_QUERY_KEY, filter],
    queryFn: () => {
      const useCase = new GetTasksUseCase(getTaskRepository());
      return useCase.execute(filter);
    },
  });
};
