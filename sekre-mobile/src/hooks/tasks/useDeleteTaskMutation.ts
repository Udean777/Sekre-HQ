import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeleteTaskUseCase } from '@core/usecases/tasks/DeleteTaskUseCase';
import { getTaskRepository } from '@di/container';
import type { TaskId } from '@core/domain/entities/Task';
import { TASKS_QUERY_KEY } from './useTasksQuery';

export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, TaskId>({
    mutationFn: id => {
      const useCase = new DeleteTaskUseCase(getTaskRepository());
      return useCase.execute(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
};
