import type { IMemberRepository } from '@core/ports/IMemberRepository';
import type { MemberId } from '@core/domain/entities/Member';

export class DeleteMemberUseCase {
  constructor(private readonly memberRepository: IMemberRepository) {}

  async execute(id: MemberId): Promise<void> {
    return this.memberRepository.deleteMember(id);
  }
}
