import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/api-client";

export type UserRole = "OWNER" | "ADMIN" | "MEMBER";

export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

export type MemberStatus = "ACTIVE" | "SUSPENDED";

export interface Member {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: MemberStatus;
  must_reset_password: boolean;
  temporary_password: string;
}

interface FetchMembersParams extends PaginationParams {
  search?: string;
  role?: string;
  status?: string;
  without_division?: boolean;
}

const fetchMembers = async (params: FetchMembersParams) => {
  const { data } = await apiClient.get<{ data: PaginatedResponse<Member> }>(
    "/members",
    {
      params,
    },
  );
  return data.data.data;
};

export const useMembers = (params: FetchMembersParams) => {
  return useQuery({
    queryKey: ["members", params],
    queryFn: () => fetchMembers(params),
  });
};
