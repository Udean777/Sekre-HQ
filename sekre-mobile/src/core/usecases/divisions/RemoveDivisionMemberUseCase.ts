import type { IDivisionRepository } from '@core/ports/IDivisionRepository';
import type { DivisionId } from '@core/domain/entities/Division';

export class RemoveDivisionMemberUseCase {
  constructor(private readonly divisionRepository: IDivisionRepository) {}

  async execute(id: DivisionId, userId: string): Promise<void> {
    return this.divisionRepository.removeMember(id, userId);
  }
}
