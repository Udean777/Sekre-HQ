import type { Page } from './Page';
import type { DivisionId } from '@core/domain/ids';

export type { DivisionId };

export type DivisionRole = 'HEAD' | 'STAFF';

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
  pageSize?: number;
}

export type DivisionPage = Page<Division>;
