import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import type { PaginatedResponse } from "@/shared/types";
import type {
  Transaction,
  TransactionFilters,
} from "@/shared/types/finance.types";

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters.division_id)
        params.append("division_id", filters.division_id);
      if (filters.type) params.append("type", filters.type);
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date) params.append("end_date", filters.end_date);
      if (filters.search) params.append("search", filters.search);
      if (filters.min_amount)
        params.append("min_amount", filters.min_amount.toString());
      if (filters.max_amount)
        params.append("max_amount", filters.max_amount.toString());
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.page_size)
        params.append("page_size", filters.page_size.toString());

      const { data } = await apiClient.get<{ data: PaginatedResponse<Transaction> }>(
        `/transactions?${params.toString()}`,
      );
      return data.data.data;
    },
  });
}
