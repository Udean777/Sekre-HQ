import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import { UserRole } from "./use-members";

export interface CreateMemberData {
  email: string;
  full_name: string;
  role: UserRole;
  division_id?: string;
  division_role?: "HEAD" | "STAFF";
}

export const useCreateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMemberData) => {
      const response = await apiClient.post("/members/create", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
};
