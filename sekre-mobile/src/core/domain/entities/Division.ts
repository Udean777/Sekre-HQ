// Branded types untuk type safety
export type DivisionId = string & { __brand: 'DivisionId' };

export type DivisionRole = 'HEAD' | 'MEMBER';

export interface Division {
  id: DivisionId;
  name: string;
  description: string | null;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DivisionMember {
  userId: string;
  fullName: string;
  email: string;
  role: DivisionRole;
  joinedAt: Date;
}

export interface DivisionDetail extends Division {
  members: DivisionMember[];
}

export interface DivisionFilter {
  search?: string;
  page?: number;
  limit?: number;
}

export interface DivisionListResult {
  divisions: Division[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
