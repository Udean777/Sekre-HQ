import type { Member, MemberId, MemberPage } from '@core/domain/entities/Member';
import type { MemberDTO, MemberListResponseDTO } from '@data/dto/member.dto';
import { mapPaginationMeta } from './pagination.mapper';

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

export const mapMemberListDTOToPage = (dto: MemberListResponseDTO): MemberPage => ({
  items: dto.data.data.map(mapMemberDTOToEntity),
  meta: mapPaginationMeta(dto.data.pagination),
});
