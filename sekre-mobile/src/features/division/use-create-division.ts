import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import { DivisionFormData, Division } from "./division.schema";

export const useCreateDivision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DivisionFormData) => {
      const response = await apiClient.post<{ data: Division }>(
        "/divisions",
        data,
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
    },
  });
};
