import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import type { ApiResponse } from "@/shared/types";

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<null>>(
        `/transactions/${id}`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: ["transactions"] });
      queryClient.refetchQueries({ queryKey: ["finance-summary"] });
    },
  });
}
