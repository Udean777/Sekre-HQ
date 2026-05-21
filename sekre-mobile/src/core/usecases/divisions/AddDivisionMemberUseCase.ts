import type { IDivisionRepository, AddDivisionMemberParams } from '@core/ports/IDivisionRepository';
import type { DivisionId } from '@core/domain/entities/Division';

export class AddDivisionMemberUseCase {
  constructor(private readonly divisionRepository: IDivisionRepository) {}

  async execute(id: DivisionId, params: AddDivisionMemberParams): Promise<void> {
    return this.divisionRepository.addMember(id, params);
  }
}
