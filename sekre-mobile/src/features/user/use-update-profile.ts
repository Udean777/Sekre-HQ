import { useMutation } from "@tanstack/react-query";
import { apiClient } from "../../shared/api/api-client";
import { useAuthStore } from "../../shared/store/auth-store";
import { User } from "../../entities/user/user.types";

export interface UpdateProfilePayload {
  full_name: string;
  email: string;
}

interface UpdateProfileResponse {
  message: string;
  data: User;
}

export function useUpdateProfile() {
  const updateUser = useAuthStore((state) => state.updateUser);

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const response = await apiClient.patch<UpdateProfileResponse>(
        "/users/me/profile",
        payload,
      );
      return response.data.data;
    },
    onSuccess: (updatedUser) => {
      // Update local global state with new user data
      updateUser({
        full_name: updatedUser.full_name,
        email: updatedUser.email,
      });
    },
  });
}
