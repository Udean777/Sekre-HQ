import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";
import {
  PaginatedDivisions,
  Division,
  DivisionWithMembers,
} from "./division.schema";

export const useDivisions = (search?: string) => {
  return useInfiniteQuery({
    queryKey: ["divisions", search],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get<{ data: PaginatedDivisions }>(
        "/divisions",
        {
          params: {
            page: pageParam,
            page_size: 20,
            search,
          },
        },
      );
      // Backend returns { data: { data: [...], pagination: {...} } }
      return response.data.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.total_pages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
};

export const useDivision = (id: string) => {
  return useQuery({
    queryKey: ["divisions", id],
    queryFn: async () => {
      const response = await apiClient.get<{ data: DivisionWithMembers }>(
        `/divisions/${id}`,
      );
      return response.data.data;
    },
    enabled: !!id,
  });
};
