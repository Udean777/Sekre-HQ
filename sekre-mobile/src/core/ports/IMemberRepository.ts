import type {
  Member,
  MemberId,
  MemberFilter,
  MemberListResult,
  OrgRole,
} from '@core/domain/entities/Member';

export interface CreateMemberParams {
  email: string;
  role: OrgRole;
}

export interface UpdateMemberParams {
  role: OrgRole;
}

export interface IMemberRepository {
  getMembers(filter?: MemberFilter): Promise<MemberListResult>;
  getMemberById(id: MemberId): Promise<Member>;
  createMember(params: CreateMemberParams): Promise<Member>;
  updateMember(id: MemberId, params: UpdateMemberParams): Promise<Member>;
  deleteMember(id: MemberId): Promise<void>;
}
