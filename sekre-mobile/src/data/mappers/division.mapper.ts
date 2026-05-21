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
  DivisionResponseDTO,
  DivisionDetailResponseDTO,
} from '@data/dto/division.dto';

export const mapDivisionDTOToEntity = (dto: DivisionDTO): Division => ({
  id: dto.id as DivisionId,
  name: dto.name,
  description: null, // tidak ada di response
  memberCount: 0,    // tidak ada di response
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
});

export const mapDivisionMemberDTOToEntity = (dto: DivisionMemberDTO): DivisionMember => ({
  userId: dto.user.id,
  fullName: dto.user.full_name,
  email: dto.user.email,
  role: dto.division_role,
  joinedAt: new Date(dto.joined_at),
});

export const mapDivisionDetailDTOToEntity = (dto: DivisionDetailDTO): DivisionDetail => ({
  ...mapDivisionDTOToEntity(dto.division),
  members: dto.members.map(mapDivisionMemberDTOToEntity),
});

export const mapDivisionListDTOToResult = (dto: DivisionListResponseDTO): DivisionListResult => ({
  divisions: dto.data.data.map(mapDivisionDTOToEntity),
  total: dto.data.pagination.total_items,
  page: dto.data.pagination.page,
  limit: dto.data.pagination.page_size,
  totalPages: dto.data.pagination.total_pages,
});

export const mapDivisionResponseDTOToEntity = (dto: DivisionResponseDTO): Division =>
  mapDivisionDTOToEntity(dto.data);

export const mapDivisionDetailResponseDTOToEntity = (dto: DivisionDetailResponseDTO): DivisionDetail =>
  mapDivisionDetailDTOToEntity(dto.data);
