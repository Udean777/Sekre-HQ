import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import type { ImportPreviewResult } from "@/shared/types/member.types";

export function useImportPreview() {
  return useMutation({
    mutationFn: async (file: { uri: string; name: string; type: string }) => {
      const form = new FormData();
      form.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);
      const response = await apiClient.post("/members/preview-import", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.data as ImportPreviewResult;
    },
  });
}
