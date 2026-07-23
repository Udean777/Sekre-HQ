import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: { token: string; new_password: string }) => {
      await apiClient.post("/auth/reset-password", data);
    },
  });
}
