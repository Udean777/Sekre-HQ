import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import { TaskFormData } from "./task.schema";

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TaskFormData>;
    }) => {
      const payload = {
        ...data,
        assignee_id: data.assignee_id || null,
        due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
      };
      const response = await apiClient.put(`/tasks/${id}`, payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks", variables.id] });
    },
  });
}
