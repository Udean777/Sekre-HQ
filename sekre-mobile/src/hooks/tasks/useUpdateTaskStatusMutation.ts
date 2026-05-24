import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
  type InfiniteData,
} from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { UpdateTaskStatusUseCase } from '@core/usecases/tasks/UpdateTaskStatusUseCase';
import { getTaskRepository } from '@di/container';
import { showToast } from '@store/slices/uiSlice';
import type { Task, TaskId, TaskPage, TaskStatus } from '@core/domain/entities/Task';
import { TASKS_QUERY_KEY } from './useTasksQuery';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MutationVariables {
  id: TaskId;
  status: TaskStatus;
}

interface MutationContext {
  previousQueries: Array<{ queryKey: readonly unknown[]; data: unknown }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Update task di dalam InfiniteData<TaskPage> secara immutable.
 * Dipakai untuk optimistic update dan sync setelah success.
 */
const updateTaskInInfiniteData = (
  old: InfiniteData<TaskPage> | undefined,
  updater: (task: Task) => Task,
  predicate: (task: Task) => boolean,
): InfiniteData<TaskPage> | undefined => {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map(page => ({
      ...page,
      items: page.items.map(task => (predicate(task) ? updater(task) : task)),
    })),
  };
};

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
      // Cancel in-flight refetches supaya tidak overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: [TASKS_QUERY_KEY] });

      // Snapshot semua active task list queries untuk rollback
      const taskQueries = queryClient.getQueriesData<InfiniteData<TaskPage>>({
        queryKey: [TASKS_QUERY_KEY],
      });

      const previousQueries = taskQueries.map(([queryKey, data]) => ({
        queryKey,
        data,
      }));

      // Apply optimistic update ke semua cached infinite task queries
      queryClient.setQueriesData<InfiniteData<TaskPage>>(
        { queryKey: [TASKS_QUERY_KEY] },
        old => updateTaskInInfiniteData(
          old,
          task => ({ ...task, status, updatedAt: new Date() }),
          task => task.id === id,
        ),
      );

      return { previousQueries };
    },

    // ── On success — sync cache dengan server response ─────────────────────
    onSuccess: updatedTask => {
      queryClient.setQueriesData<InfiniteData<TaskPage>>(
        { queryKey: [TASKS_QUERY_KEY] },
        old => updateTaskInInfiniteData(
          old,
          () => updatedTask,
          task => task.id === updatedTask.id,
        ),
      );
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
