import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import { TaskFormData } from "./task.schema";

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TaskFormData) => {
      const payload = {
        ...data,
        assignee_id: data.assignee_id || null,
        due_date: data.due_date ? new Date(data.due_date).toISOString() : null,
      };
      const response = await apiClient.post("/tasks", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
