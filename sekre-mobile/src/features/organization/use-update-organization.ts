import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import { useAuthStore } from "@/shared/store/auth-store";
import { OrganizationFormData } from "./organization.schema";
import { Organization } from "@/entities/user/user.types";

interface UpdateOrganizationResponse {
  message: string;
  data: Organization;
}

export const useUpdateOrganization = () => {
  const updateOrganizationStore = useAuthStore(
    (state) => state.updateOrganization,
  );

  return useMutation({
    mutationFn: async (data: OrganizationFormData) => {
      const response = await apiClient.patch<UpdateOrganizationResponse>(
        "/organizations/me",
        data,
      );
      return response.data;
    },
    onSuccess: (data) => {
      updateOrganizationStore(data.data);
    },
  });
};
