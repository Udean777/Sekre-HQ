// Backend response shapes (snake_case)
import type { OrgRole } from '@core/domain/entities/Member';

export interface MemberDTO {
  id: string;
  email: string;
  full_name: string;
  role: OrgRole;
}

export interface MemberListResponseDTO {
  success: boolean;
  message: string;
  data: {
    data: MemberDTO[];
    pagination: {
      page: number;
      page_size: number;
      total_items: number;
      total_pages: number;
    };
  };
}

// Request shapes
export interface CreateMemberRequestDTO {
  email: string;
  full_name: string;
  role: OrgRole;
  division_id?: string;
  division_ids?: string[];
  division_role?: 'HEAD' | 'STAFF';
}

export interface UpdateMemberRequestDTO {
  role: OrgRole;
}
