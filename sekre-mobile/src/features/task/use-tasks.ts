import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import { Task } from "@/shared/types";

interface UseTasksParams {
  division_id?: string;
  assignee_id?: string;
}

export function useTasks(params?: UseTasksParams) {
  return useQuery({
    queryKey: ["tasks", params],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        data: {
          data: { task: Task; assignee: any; division: any }[];
          pagination: any;
        };
      }>("/tasks", {
        params,
      });
      return data.data.data.map((item) => ({
        ...item.task,
        assignee: item.assignee,
        division: item.division,
      }));
    },
  });
}
