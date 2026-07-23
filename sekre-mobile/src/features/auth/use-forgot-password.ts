import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await apiClient.post("/auth/forgot-password", data);
      return response.data.data as { token: string };
    },
  });
}
