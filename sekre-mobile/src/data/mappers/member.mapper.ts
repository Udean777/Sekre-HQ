import type { Member, MemberId, MemberListResult } from '@core/domain/entities/Member';
import type { MemberDTO, MemberListResponseDTO } from '@data/dto/member.dto';

export const mapMemberDTOToEntity = (dto: MemberDTO): Member => ({
  id: dto.id as MemberId,
  userId: dto.id, // backend tidak return user_id terpisah, id = user_id
  email: dto.email,
  fullName: dto.full_name,
  role: dto.role,
  divisionId: null, // tidak ada di list response
  divisionName: null, // tidak ada di list response
  joinedAt: new Date(), // tidak ada di list response
});

export const mapMemberListDTOToResult = (dto: MemberListResponseDTO): MemberListResult => ({
  members: dto.data.data.map(mapMemberDTOToEntity),
  total: dto.data.pagination.total_items,
  page: dto.data.pagination.page,
  limit: dto.data.pagination.page_size,
  totalPages: dto.data.pagination.total_pages,
});
