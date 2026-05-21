import type { AxiosInstance } from 'axios';
import type {
  IMemberRepository,
  CreateMemberParams,
  UpdateMemberParams,
} from '@core/ports/IMemberRepository';
import type {
  Member,
  MemberId,
  MemberFilter,
  MemberListResult,
} from '@core/domain/entities/Member';
import { ENDPOINTS } from '@data/http/endpoints';
import type {
  MemberDTO,
  MemberListResponseDTO,
  CreateMemberRequestDTO,
  UpdateMemberRequestDTO,
} from '@data/dto/member.dto';
import { mapMemberDTOToEntity, mapMemberListDTOToResult } from '@data/mappers/member.mapper';

export class MemberRepositoryImpl implements IMemberRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getMembers(filter?: MemberFilter): Promise<MemberListResult> {
    const params: Record<string, string | number> = {};
    if (filter?.search) params.search = filter.search;
    if (filter?.role) params.role = filter.role;
    if (filter?.page) params.page = filter.page;
    if (filter?.limit) params.limit = filter.limit;

    const { data } = await this.http.get<MemberListResponseDTO>(ENDPOINTS.MEMBERS.LIST, { params });
    return mapMemberListDTOToResult(data);
  }

  async getMemberById(id: MemberId): Promise<Member> {
    const { data } = await this.http.get<MemberDTO>(ENDPOINTS.MEMBERS.UPDATE(id));
    return mapMemberDTOToEntity(data);
  }

  async createMember(params: CreateMemberParams): Promise<Member> {
    const payload: CreateMemberRequestDTO = {
      email: params.email,
      role: params.role,
    };
    const { data } = await this.http.post<MemberDTO>(ENDPOINTS.MEMBERS.CREATE, payload);
    return mapMemberDTOToEntity(data);
  }

  async updateMember(id: MemberId, params: UpdateMemberParams): Promise<Member> {
    const payload: UpdateMemberRequestDTO = { role: params.role };
    const { data } = await this.http.put<MemberDTO>(ENDPOINTS.MEMBERS.UPDATE(id), payload);
    return mapMemberDTOToEntity(data);
  }

  async deleteMember(id: MemberId): Promise<void> {
    await this.http.delete(ENDPOINTS.MEMBERS.DELETE(id));
  }
}
