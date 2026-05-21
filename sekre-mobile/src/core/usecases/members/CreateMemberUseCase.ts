import type { IMemberRepository, CreateMemberParams } from '@core/ports/IMemberRepository';
import type { Member } from '@core/domain/entities/Member';

export class CreateMemberUseCase {
  constructor(private readonly memberRepository: IMemberRepository) {}

  async execute(params: CreateMemberParams): Promise<Member> {
    return this.memberRepository.createMember(params);
  }
}
