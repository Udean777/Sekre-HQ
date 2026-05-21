import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateTaskUseCase } from '@core/usecases/tasks/UpdateTaskUseCase';
import { getTaskRepository } from '@di/container';
import type { Task, TaskId } from '@core/domain/entities/Task';
import type { UpdateTaskParams } from '@core/ports/ITaskRepository';
import { TASKS_QUERY_KEY } from './useTasksQuery';

export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Task, Error, { id: TaskId; params: UpdateTaskParams }>({
    mutationFn: ({ id, params }) => {
      const useCase = new UpdateTaskUseCase(getTaskRepository());
      return useCase.execute(id, params);
    },
    onSuccess: updatedTask => {
      // Update cache untuk detail task
      queryClient.setQueryData([TASKS_QUERY_KEY, updatedTask.id], updatedTask);
      // Invalidate list
      void queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
};
