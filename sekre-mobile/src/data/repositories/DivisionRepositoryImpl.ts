import type { AxiosInstance } from 'axios';
import type {
  IDivisionRepository,
  CreateDivisionParams,
  UpdateDivisionParams,
  AddDivisionMemberParams,
  UpdateDivisionMemberParams,
} from '@core/ports/IDivisionRepository';
import type {
  Division,
  DivisionId,
  DivisionDetail,
  DivisionFilter,
  DivisionPage,
} from '@core/domain/entities/Division';
import { ENDPOINTS } from '@data/http/endpoints';
import type {
  DivisionListResponseDTO,
  DivisionResponseDTO,
  DivisionDetailResponseDTO,
  CreateDivisionRequestDTO,
  UpdateDivisionRequestDTO,
  AddDivisionMemberRequestDTO,
  UpdateDivisionMemberRequestDTO,
} from '@data/dto/division.dto';
import {
  mapDivisionListDTOToPage,
  mapDivisionResponseDTOToEntity,
  mapDivisionDetailResponseDTOToEntity,
} from '@data/mappers/division.mapper';

export class DivisionRepositoryImpl implements IDivisionRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getDivisions(filter?: DivisionFilter): Promise<DivisionPage> {
    const params: Record<string, string | number> = {};
    if (filter?.search) params['search'] = filter.search;
    if (filter?.page) params['page'] = filter.page;
    if (filter?.pageSize) params['page_size'] = filter.pageSize;

    const { data } = await this.http.get<DivisionListResponseDTO>(ENDPOINTS.DIVISIONS.LIST, {
      params,
    });
    return mapDivisionListDTOToPage(data);
  }

  async getDivisionById(id: DivisionId): Promise<DivisionDetail> {
    const { data } = await this.http.get<DivisionDetailResponseDTO>(ENDPOINTS.DIVISIONS.DETAIL(id));
    return mapDivisionDetailResponseDTOToEntity(data);
  }

  async createDivision(params: CreateDivisionParams): Promise<Division> {
    const payload: CreateDivisionRequestDTO = {
      name: params.name,
      ...(params.description !== undefined && { description: params.description }),
    };
    const { data } = await this.http.post<DivisionResponseDTO>(ENDPOINTS.DIVISIONS.CREATE, payload);
    return mapDivisionResponseDTOToEntity(data);
  }

  async updateDivision(id: DivisionId, params: UpdateDivisionParams): Promise<Division> {
    const payload: UpdateDivisionRequestDTO = {
      name: params.name,
      ...(params.description !== undefined && { description: params.description }),
    };
    const { data } = await this.http.put<DivisionResponseDTO>(
      ENDPOINTS.DIVISIONS.UPDATE(id),
      payload,
    );
    return mapDivisionResponseDTOToEntity(data);
  }

  async deleteDivision(id: DivisionId): Promise<void> {
    await this.http.delete(ENDPOINTS.DIVISIONS.DELETE(id));
  }

  async addMember(id: DivisionId, params: AddDivisionMemberParams): Promise<void> {
    const payload: AddDivisionMemberRequestDTO = {
      user_id: params.userId,
      role: params.role,
    };
    await this.http.post(ENDPOINTS.DIVISIONS.ADD_MEMBER(id), payload);
  }

  async updateMember(
    id: DivisionId,
    userId: string,
    params: UpdateDivisionMemberParams,
  ): Promise<void> {
    const payload: UpdateDivisionMemberRequestDTO = { role: params.role };
    await this.http.patch(ENDPOINTS.DIVISIONS.UPDATE_MEMBER(id, userId), payload);
  }

  async removeMember(id: DivisionId, userId: string): Promise<void> {
    await this.http.delete(ENDPOINTS.DIVISIONS.REMOVE_MEMBER(id, userId));
  }
}
