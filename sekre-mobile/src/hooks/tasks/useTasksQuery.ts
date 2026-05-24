import { useInfiniteQuery, type UseInfiniteQueryResult, type InfiniteData } from '@tanstack/react-query';
import { GetTasksUseCase } from '@core/usecases/tasks/GetTasksUseCase';
import { getTaskRepository } from '@di/container';
import type { TaskFilter, TaskPage } from '@core/domain/entities/Task';

export const TASKS_QUERY_KEY = 'tasks';

export const useTasksQuery = (
  filter?: Omit<TaskFilter, 'page'>,
): UseInfiniteQueryResult<InfiniteData<TaskPage>, Error> => {
  return useInfiniteQuery<TaskPage, Error, InfiniteData<TaskPage>, unknown[], number>({
    queryKey: [TASKS_QUERY_KEY, filter],
    queryFn: ({ pageParam }) => {
      const useCase = new GetTasksUseCase(getTaskRepository());
      return useCase.execute({ ...filter, page: pageParam });
    },
    initialPageParam: 1,
    getNextPageParam: last => last.meta.nextPage ?? undefined,
  });
};
