import type { IMemberRepository } from '@core/ports/IMemberRepository';
import type { MemberPage, MemberFilter } from '@core/domain/entities/Member';

export class GetMembersUseCase {
  constructor(private readonly memberRepository: IMemberRepository) {}

  async execute(filter?: MemberFilter): Promise<MemberPage> {
    return this.memberRepository.getMembers(filter);
  }
}
