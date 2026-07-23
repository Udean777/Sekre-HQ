import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import { Task } from "@/shared/types";

export function useTask(id?: string) {
  return useQuery({
    queryKey: ["tasks", id],
    queryFn: async () => {
      if (!id) throw new Error("Task ID is required");
      const { data } = await apiClient.get<{ data: { task: Task; assignee: any; division: any } }>(`/tasks/${id}`);
      return { ...data.data.task, assignee: data.data.assignee, division: data.data.division };
    },
    enabled: !!id,
  });
}
