import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { GetTaskByIdUseCase } from '@core/usecases/tasks/GetTaskByIdUseCase';
import { getTaskRepository } from '@di/container';
import type { Task, TaskId } from '@core/domain/entities/Task';
import { TASKS_QUERY_KEY } from './useTasksQuery';

export const useTaskQuery = (id: TaskId): UseQueryResult<Task, Error> => {
  return useQuery<Task, Error>({
    queryKey: [TASKS_QUERY_KEY, id],
    queryFn: () => {
      const useCase = new GetTaskByIdUseCase(getTaskRepository());
      return useCase.execute(id);
    },
    enabled: !!id,
  });
};
