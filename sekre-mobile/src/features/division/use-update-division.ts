import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import {
  DivisionFormData,
  Division,
  DivisionWithMembers,
} from "./division.schema";

export const useUpdateDivision = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DivisionFormData) => {
      const response = await apiClient.put<{ data: Division }>(
        `/divisions/${id}`,
        data,
      );
      return response.data.data;
    },
    onSuccess: (updatedDivision) => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
      queryClient.setQueryData(
        ["divisions", id],
        (old: DivisionWithMembers | undefined) => {
          if (!old) return old;
          return {
            ...old,
            division: updatedDivision,
          };
        },
      );
    },
  });
};
