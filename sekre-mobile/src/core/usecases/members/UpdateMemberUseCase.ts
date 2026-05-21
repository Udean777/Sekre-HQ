import type { IMemberRepository, UpdateMemberParams } from '@core/ports/IMemberRepository';
import type { Member, MemberId } from '@core/domain/entities/Member';

export class UpdateMemberUseCase {
  constructor(private readonly memberRepository: IMemberRepository) {}

  async execute(id: MemberId, params: UpdateMemberParams): Promise<Member> {
    return this.memberRepository.updateMember(id, params);
  }
}
