import type { Member, MemberId, MemberListResult } from '@core/domain/entities/Member';
import type { MemberDTO, MemberListResponseDTO } from '@data/dto/member.dto';

export const mapMemberDTOToEntity = (dto: MemberDTO): Member => ({
  id: dto.id as MemberId,
  userId: dto.user_id,
  email: dto.email,
  fullName: dto.full_name,
  role: dto.role,
  divisionId: dto.division_id,
  divisionName: dto.division_name,
  joinedAt: new Date(dto.joined_at),
});

export const mapMemberListDTOToResult = (dto: MemberListResponseDTO): MemberListResult => ({
  members: dto.members.map(mapMemberDTOToEntity),
  total: dto.total,
  page: dto.page,
  limit: dto.limit,
  totalPages: dto.total_pages,
});
