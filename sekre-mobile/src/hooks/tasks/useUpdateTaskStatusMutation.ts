import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { UpdateTaskStatusUseCase } from '@core/usecases/tasks/UpdateTaskStatusUseCase';
import { getTaskRepository } from '@di/container';
import { showToast } from '@store/slices/uiSlice';
import type { Task, TaskId, TaskListResult, TaskStatus } from '@core/domain/entities/Task';
import { TASKS_QUERY_KEY } from './useTasksQuery';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MutationVariables {
  id: TaskId;
  status: TaskStatus;
}

interface MutationContext {
  previousQueries: Array<{ queryKey: unknown[]; data: unknown }>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useUpdateTaskStatusMutation = (): UseMutationResult<
  Task,
  Error,
  MutationVariables,
  MutationContext
> => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation<Task, Error, MutationVariables, MutationContext>({
    mutationFn: ({ id, status }) => {
      const useCase = new UpdateTaskStatusUseCase(getTaskRepository());
      return useCase.execute(id, status);
    },

    // ── Optimistic update ──────────────────────────────────────────────────
    onMutate: async ({ id, status }) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: [TASKS_QUERY_KEY] });

      // Snapshot all active task list queries for rollback
      const taskQueries = queryClient.getQueriesData<TaskListResult>({
        queryKey: [TASKS_QUERY_KEY],
      });

      const previousQueries = taskQueries.map(([queryKey, data]) => ({
        queryKey: queryKey as unknown[],
        data,
      }));

      // Apply optimistic update to all cached task list queries
      queryClient.setQueriesData<TaskListResult>({ queryKey: [TASKS_QUERY_KEY] }, old => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map(task =>
            task.id === id ? { ...task, status, updatedAt: new Date() } : task,
          ),
        };
      });

      return { previousQueries };
    },

    // ── On success — sync cache with server response ───────────────────────
    onSuccess: updatedTask => {
      queryClient.setQueriesData<TaskListResult>({ queryKey: [TASKS_QUERY_KEY] }, old => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map(task => (task.id === updatedTask.id ? updatedTask : task)),
        };
      });
    },

    // ── On error — rollback + show toast ──────────────────────────────────
    onError: (_error, _variables, context) => {
      if (context?.previousQueries) {
        for (const { queryKey, data } of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }

      dispatch(
        showToast({
          type: 'error',
          message: 'Gagal memperbarui status tugas. Silakan coba lagi.',
        }),
      );
    },

    // ── Always invalidate after settle ────────────────────────────────────
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
  });
};
