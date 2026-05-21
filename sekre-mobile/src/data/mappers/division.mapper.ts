import type {
  Division,
  DivisionId,
  DivisionMember,
  DivisionDetail,
  DivisionListResult,
} from '@core/domain/entities/Division';
import type {
  DivisionDTO,
  DivisionMemberDTO,
  DivisionDetailDTO,
  DivisionListResponseDTO,
} from '@data/dto/division.dto';

export const mapDivisionMemberDTOToEntity = (dto: DivisionMemberDTO): DivisionMember => ({
  userId: dto.user_id,
  fullName: dto.full_name,
  email: dto.email,
  role: dto.role,
  joinedAt: new Date(dto.joined_at),
});

export const mapDivisionDTOToEntity = (dto: DivisionDTO): Division => ({
  id: dto.id as DivisionId,
  name: dto.name,
  description: dto.description,
  memberCount: dto.member_count,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
});

export const mapDivisionDetailDTOToEntity = (dto: DivisionDetailDTO): DivisionDetail => ({
  ...mapDivisionDTOToEntity(dto),
  members: dto.members.map(mapDivisionMemberDTOToEntity),
});

export const mapDivisionListDTOToResult = (dto: DivisionListResponseDTO): DivisionListResult => ({
  divisions: dto.divisions.map(mapDivisionDTOToEntity),
  total: dto.total,
  page: dto.page,
  limit: dto.limit,
  totalPages: dto.total_pages,
});
