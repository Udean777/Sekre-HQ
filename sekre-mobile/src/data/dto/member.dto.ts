// Backend response shapes (snake_case)
import type { OrgRole } from '@core/domain/entities/Member';

export interface MemberDTO {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: OrgRole;
  division_id: string | null;
  division_name: string | null;
  joined_at: string;
}

export interface MemberListResponseDTO {
  members: MemberDTO[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Request shapes
export interface CreateMemberRequestDTO {
  email: string;
  role: OrgRole;
}

export interface UpdateMemberRequestDTO {
  role: OrgRole;
}
