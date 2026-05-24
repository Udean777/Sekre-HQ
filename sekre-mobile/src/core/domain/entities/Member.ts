import type { Page } from './Page';

// Branded types untuk type safety
export type MemberId = string & { __brand: 'MemberId' };

export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface Member {
  id: MemberId;
  userId: string;
  email: string;
  fullName: string;
  role: OrgRole;
  divisionId: string | null;
  divisionName: string | null;
  joinedAt: Date;
}

export interface MemberFilter {
  search?: string;
  role?: OrgRole;
  page?: number;
  pageSize?: number;
}

export type MemberPage = Page<Member>;
