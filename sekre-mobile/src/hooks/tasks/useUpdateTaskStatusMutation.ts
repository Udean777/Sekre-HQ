import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateTaskStatusUseCase } from '@core/usecases/tasks/UpdateTaskStatusUseCase';
import { getTaskRepository } from '@di/container';
import type { Task, TaskId, TaskStatus } from '@core/domain/entities/Task';
import { TASKS_QUERY_KEY } from './useTasksQuery';

export const useUpdateTaskStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, { id: TaskId; status: TaskStatus }>({
    mutationFn: ({ id, status }) => {
      const useCase = new UpdateTaskStatusUseCase(getTaskRepository());
      return useCase.execute(id, status);
    },
    onSuccess: updatedTask => {
      queryClient.setQueryData([TASKS_QUERY_KEY, updatedTask.id], updatedTask);
      void queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
};
