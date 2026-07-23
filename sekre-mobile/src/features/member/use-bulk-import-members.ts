import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import type { ApiResponse } from "@/shared/types";
import type { BulkImportResult } from "@/shared/types/member.types";

export const useBulkImportMembers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: { uri: string; name: string; type: string }) => {
      const formData = new FormData();
      formData.append("file", file as any);
      const response = await apiClient.post<ApiResponse<BulkImportResult>>(
        "/members/bulk-import",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
};
