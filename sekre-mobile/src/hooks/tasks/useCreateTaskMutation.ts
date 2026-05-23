import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { CreateTaskUseCase } from '@core/usecases/tasks/CreateTaskUseCase';
import { getTaskRepository } from '@di/container';
import type { Task } from '@core/domain/entities/Task';
import type { CreateTaskParams } from '@core/ports/ITaskRepository';
import { TASKS_QUERY_KEY } from './useTasksQuery';

export const useCreateTaskMutation = (): UseMutationResult<Task, Error, CreateTaskParams> => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, CreateTaskParams>({
    mutationFn: params => {
      const useCase = new CreateTaskUseCase(getTaskRepository());
      return useCase.execute(params);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
};
