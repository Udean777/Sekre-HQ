import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import { TaskStatus } from "@/shared/types";

import { Task } from "@/shared/types";

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      queryClient.setQueriesData(
        { queryKey: ["tasks"] },
        (old: Task[] | undefined) => {
          if (!old) return old;
          return old.map((task) =>
            task.id === id ? { ...task, status } : task,
          );
        },
      );
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      const response = await apiClient.patch(`/tasks/${id}/status`, {
        status,
      });
      return response.data;
    },
  });
}
