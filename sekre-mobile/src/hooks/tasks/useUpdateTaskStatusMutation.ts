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
  previousListQueries: Array<{ queryKey: readonly unknown[]; data: unknown }>;
  previousDetailData: Task | undefined;
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
      // Cancel hanya list queries — jangan cancel detail query supaya
      // getTaskById setelah PATCH tidak di-discard
      await queryClient.cancelQueries({
        queryKey: [TASKS_QUERY_KEY],
        predicate: query =>
          query.queryKey.length === 2 &&
          query.queryKey[0] === TASKS_QUERY_KEY &&
          typeof query.queryKey[1] === 'object', // filter object = list query
      });

      // Snapshot list queries untuk rollback
      const listQueries = queryClient.getQueriesData<InfiniteData<TaskPage>>({
        queryKey: [TASKS_QUERY_KEY],
        predicate: query =>
          query.queryKey.length === 2 &&
          query.queryKey[0] === TASKS_QUERY_KEY &&
          typeof query.queryKey[1] === 'object',
      });

      const previousListQueries = listQueries.map(([queryKey, data]) => ({
        queryKey,
        data,
      }));

      // Snapshot detail query untuk rollback
      const previousDetailData = queryClient.getQueryData<Task>([TASKS_QUERY_KEY, id]);

      // Optimistic update list queries
      queryClient.setQueriesData<InfiniteData<TaskPage>>(
        {
          queryKey: [TASKS_QUERY_KEY],
          predicate: query =>
            query.queryKey.length === 2 &&
            query.queryKey[0] === TASKS_QUERY_KEY &&
            typeof query.queryKey[1] === 'object',
        },
        old => updateTaskInInfiniteData(
          old,
          task => ({ ...task, status, updatedAt: new Date() }),
          task => task.id === id,
        ),
      );

      // Optimistic update detail query
      if (previousDetailData) {
        queryClient.setQueryData<Task>([TASKS_QUERY_KEY, id], {
          ...previousDetailData,
          status,
          updatedAt: new Date(),
        });
      }

      return { previousListQueries, previousDetailData };
    },

    // ── On success — sync cache dengan server response ─────────────────────
    onSuccess: (updatedTask) => {
      // Sync list queries
      queryClient.setQueriesData<InfiniteData<TaskPage>>(
        {
          queryKey: [TASKS_QUERY_KEY],
          predicate: query =>
            query.queryKey.length === 2 &&
            query.queryKey[0] === TASKS_QUERY_KEY &&
            typeof query.queryKey[1] === 'object',
        },
        old => updateTaskInInfiniteData(
          old,
          () => updatedTask,
          task => task.id === updatedTask.id,
        ),
      );

      // Sync detail query
      queryClient.setQueryData<Task>([TASKS_QUERY_KEY, updatedTask.id], updatedTask);
    },

    // ── On error — rollback + show toast ──────────────────────────────────
    onError: (_error, { id }, context) => {
      if (context?.previousListQueries) {
        for (const { queryKey, data } of context.previousListQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }

      if (context?.previousDetailData !== undefined) {
        queryClient.setQueryData([TASKS_QUERY_KEY, id], context.previousDetailData);
      }

      dispatch(
        showToast({
          type: 'error',
          message: 'Gagal memperbarui status tugas. Silakan coba lagi.',
        }),
      );
    },

    // ── Always invalidate after settle ────────────────────────────────────
    onSettled: (_data, _error, { id }) => {
      void queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
      void queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY, id] });
    },
  });
};
