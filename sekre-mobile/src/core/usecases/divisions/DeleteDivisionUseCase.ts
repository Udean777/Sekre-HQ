import type { IDivisionRepository } from '@core/ports/IDivisionRepository';
import type { DivisionId } from '@core/domain/entities/Division';

export class DeleteDivisionUseCase {
  constructor(private readonly divisionRepository: IDivisionRepository) {}

  async execute(id: DivisionId): Promise<void> {
    return this.divisionRepository.deleteDivision(id);
  }
}
