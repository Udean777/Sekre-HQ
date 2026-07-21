import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../shared/api/api-client";
import { useAuthStore } from "../../shared/store/auth-store";

interface DeleteAccountResponse {
  message: string;
}

export function useDeleteAccount() {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      const response =
        await apiClient.delete<DeleteAccountResponse>("/users/me");
      return response.data;
    },
    onSuccess: async () => {
      // Automatically log the user out after their account is deleted
      await logout();
    },
  });
}
