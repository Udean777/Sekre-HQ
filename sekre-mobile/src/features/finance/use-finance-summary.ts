import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import type { FinanceSummary } from "@/shared/types/finance.types";
import type { ApiResponse } from "@/shared/types";

interface SummaryFilters {
  division_id?: string;
  start_date?: string;
  end_date?: string;
}

export function useFinanceSummary(filters?: SummaryFilters) {
  return useQuery({
    queryKey: ["finance-summary", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.division_id)
        params.append("division_id", filters.division_id);
      if (filters?.start_date) params.append("start_date", filters.start_date);
      if (filters?.end_date) params.append("end_date", filters.end_date);

      const response = await apiClient.get<ApiResponse<FinanceSummary>>(
        `/finance/summary?${params.toString()}`,
      );
      return response.data.data;
    },
  });
}
