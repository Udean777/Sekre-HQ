import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";

export const useDeleteDivision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/divisions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
    },
  });
};
