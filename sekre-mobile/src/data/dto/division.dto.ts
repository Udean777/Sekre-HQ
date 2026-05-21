// Backend response shapes (snake_case)
import type { DivisionRole } from '@core/domain/entities/Division';

export interface DivisionMemberDTO {
  user_id: string;
  full_name: string;
  email: string;
  role: DivisionRole;
  joined_at: string;
}

export interface DivisionDTO {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface DivisionDetailDTO extends DivisionDTO {
  members: DivisionMemberDTO[];
}

export interface DivisionListResponseDTO {
  divisions: DivisionDTO[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
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
