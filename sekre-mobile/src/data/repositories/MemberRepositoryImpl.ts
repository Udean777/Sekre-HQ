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
  MemberPage,
} from '@core/domain/entities/Member';
import { ENDPOINTS } from '@data/http/endpoints';
import type { MemberListResponseDTO } from '@data/dto/member.dto';
import { mapMemberListDTOToPage } from '@data/mappers/member.mapper';

export class MemberRepositoryImpl implements IMemberRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getMembers(filter?: MemberFilter): Promise<MemberPage> {
    const params: Record<string, string | number> = {};
    if (filter?.search) params.search = filter.search;
    if (filter?.role) params.role = filter.role;
    if (filter?.page) params.page = filter.page;
    if (filter?.pageSize) params.page_size = filter.pageSize;

    const { data } = await this.http.get<MemberListResponseDTO>(ENDPOINTS.MEMBERS.LIST, { params });
    return mapMemberListDTOToPage(data);
  }

  async getMemberById(_id: MemberId): Promise<Member> {
    throw new Error('getMemberById not supported by this backend');
  }

  async createMember(_params: CreateMemberParams): Promise<Member> {
    throw new Error('createMember not supported — use member creation flow');
  }

  async updateMember(_id: MemberId, _params: UpdateMemberParams): Promise<Member> {
    throw new Error('updateMember not supported by this backend');
  }

  async deleteMember(id: MemberId): Promise<void> {
    await this.http.delete(ENDPOINTS.MEMBERS.DELETE(id));
  }
}
