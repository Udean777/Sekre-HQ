import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../shared/api/api-client";

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

interface ChangePasswordResponse {
  message: string;
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const response = await apiClient.post<ChangePasswordResponse>(
        "/users/me/change-password",
        payload,
      );
      return response.data;
    },
  });
}
