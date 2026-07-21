import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../shared/api/api-client";
import { AuthResponse } from "../../entities/user/user.types";
import { useAuthStore } from "../../shared/store/auth-store";

export function useLogin() {
  const loginAction = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      const response = await apiClient.post("/auth/login", credentials);
      return response.data.data as AuthResponse;
    },
    onSuccess: async (data) => {
      await loginAction(
        { user: data.user, organization: data.organization, role: data.role },
        data.tokens.access_token,
        data.tokens.refresh_token,
      );
    },
  });
}
