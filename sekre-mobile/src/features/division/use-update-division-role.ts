import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";

export interface UpdateDivisionRoleData {
  role: "HEAD" | "STAFF";
}

export const useUpdateDivisionRole = (divisionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateDivisionRoleData;
    }) => {
      const response = await apiClient.patch(
        `/divisions/${divisionId}/members/${userId}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["divisions"] });
      queryClient.invalidateQueries({ queryKey: ["divisions", divisionId] });
    },
  });
};
