// Backend response shapes (snake_case)
import type { DivisionRole } from '@core/domain/entities/Division';

export interface DivisionDTO {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DivisionMemberUserDTO {
  id: string;
  email: string;
  full_name: string;
  must_reset_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface DivisionMemberDTO {
  user: DivisionMemberUserDTO;
  division_role: DivisionRole;
  joined_at: string;
}

export interface DivisionDetailDTO {
  division: DivisionDTO;
  members: DivisionMemberDTO[];
}

export interface DivisionListResponseDTO {
  success: boolean;
  message: string;
  data: {
    data: DivisionDTO[];
    pagination: {
      page: number;
      page_size: number;
      total_items: number;
      total_pages: number;
    };
  };
}

export interface DivisionResponseDTO {
  success: boolean;
  message: string;
  data: DivisionDTO;
}

export interface DivisionDetailResponseDTO {
  success: boolean;
  message: string;
  data: DivisionDetailDTO;
}

// Request shapes
export interface CreateDivisionRequestDTO {
  name: string;
  description?: string;
}

export interface UpdateDivisionRequestDTO {
  name?: string;
  description?: string;
}

export interface AddDivisionMemberRequestDTO {
  user_id: string;
  role: DivisionRole;
}

export interface UpdateDivisionMemberRequestDTO {
  role: DivisionRole;
}
