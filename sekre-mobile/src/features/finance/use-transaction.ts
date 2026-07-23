import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import type { ApiResponse } from "@/shared/types";
import type { Transaction } from "@/shared/types/finance.types";

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}
