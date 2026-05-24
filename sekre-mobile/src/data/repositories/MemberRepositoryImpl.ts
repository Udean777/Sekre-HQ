import type { AxiosInstance } from 'axios';
import type {
  IMemberRepository,
  CreateMemberParams,
  UpdateMemberParams,
} from '@core/ports/IMemberRepository';
import type { Member, MemberId, MemberFilter, MemberPage } from '@core/domain/entities/Member';
import { ENDPOINTS } from '@data/http/endpoints';
import type { MemberListResponseDTO, CreateMemberRequestDTO } from '@data/dto/member.dto';
import { mapMemberListDTOToPage, mapMemberDTOToEntity } from '@data/mappers/member.mapper';

export class MemberRepositoryImpl implements IMemberRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getMembers(filter?: MemberFilter): Promise<MemberPage> {
    const params: Record<string, string | number> = {};
    if (filter?.search) params['search'] = filter.search;
    if (filter?.role) params['role'] = filter.role;
    if (filter?.page) params['page'] = filter.page;
    if (filter?.pageSize) params['page_size'] = filter.pageSize;

    const { data } = await this.http.get<MemberListResponseDTO>(ENDPOINTS.MEMBERS.LIST, { params });
    return mapMemberListDTOToPage(data);
  }

  async getMemberById(_id: MemberId): Promise<Member> {
    throw new Error('getMemberById not supported by this backend');
  }

  async createMember(params: CreateMemberParams): Promise<Member> {
    const payload: CreateMemberRequestDTO = {
      email: params.email,
      full_name: params.fullName,
      role: params.role,
      ...(params.divisionIds !== undefined && { division_ids: params.divisionIds }),
      ...(params.divisionId !== undefined && { division_id: params.divisionId }),
      ...(params.divisionRole !== undefined && { division_role: params.divisionRole }),
    };
    const { data } = await this.http.post<{ success: boolean; message: string; data: { email: string; full_name: string; temporary_password: string; division: string } }>(
      ENDPOINTS.MEMBERS.CREATE,
      payload,
    );
    // Backend returns invite result, not a full Member — map to partial Member
    return mapMemberDTOToEntity({
      id: '',
      email: data.data.email,
      full_name: data.data.full_name,
      role: params.role,
    });
  }

  async updateMember(_id: MemberId, _params: UpdateMemberParams): Promise<Member> {
    throw new Error('updateMember not supported by this backend');
  }

  async deleteMember(id: MemberId): Promise<void> {
    await this.http.delete(ENDPOINTS.MEMBERS.DELETE(id));
  }
}
