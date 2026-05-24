import type {
  Division,
  DivisionId,
  DivisionMember,
  DivisionDetail,
  DivisionPage,
} from '@core/domain/entities/Division';
import type {
  DivisionDTO,
  DivisionMemberDTO,
  DivisionDetailDTO,
  DivisionListResponseDTO,
  DivisionResponseDTO,
  DivisionDetailResponseDTO,
} from '@data/dto/division.dto';
import { mapPaginationMeta } from './pagination.mapper';

export const mapDivisionDTOToEntity = (dto: DivisionDTO): Division => ({
  id: dto.id as DivisionId,
  name: dto.name,
  description: null, // tidak ada di response
  memberCount: 0, // tidak ada di response
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

export const mapDivisionListDTOToPage = (dto: DivisionListResponseDTO): DivisionPage => ({
  items: dto.data.data.map(mapDivisionDTOToEntity),
  meta: mapPaginationMeta(dto.data.pagination),
});

export const mapDivisionResponseDTOToEntity = (dto: DivisionResponseDTO): Division =>
  mapDivisionDTOToEntity(dto.data);

export const mapDivisionDetailResponseDTOToEntity = (
  dto: DivisionDetailResponseDTO,
): DivisionDetail => mapDivisionDetailDTOToEntity(dto.data);
