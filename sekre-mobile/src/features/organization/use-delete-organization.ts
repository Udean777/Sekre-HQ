import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import { useAuthStore } from "@/shared/store/auth-store";

interface DeleteOrganizationResponse {
  message: string;
}

export const useDeleteOrganization = () => {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      const response =
        await apiClient.delete<DeleteOrganizationResponse>("/organizations/me");
      return response.data;
    },
    onSuccess: async () => {
      // Upon successful deletion of the organization, the user should be logged out
      await logout();
    },
  });
};
