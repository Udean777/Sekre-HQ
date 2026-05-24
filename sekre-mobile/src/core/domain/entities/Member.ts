import type { Page } from './Page';
import type { MemberId } from '@core/domain/ids';

export type { MemberId };

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
