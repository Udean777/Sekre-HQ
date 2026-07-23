import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";

export interface AddDivisionMemberData {
  user_id: string;
  role: "HEAD" | "STAFF";
}

export const useAddDivisionMember = (divisionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AddDivisionMemberData) => {
      const response = await apiClient.post(
        `/divisions/${divisionId}/members`,
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
