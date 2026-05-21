import type { IDivisionRepository, UpdateDivisionParams } from '@core/ports/IDivisionRepository';
import type { Division, DivisionId } from '@core/domain/entities/Division';

export class UpdateDivisionUseCase {
  constructor(private readonly divisionRepository: IDivisionRepository) {}

  async execute(id: DivisionId, params: UpdateDivisionParams): Promise<Division> {
    return this.divisionRepository.updateDivision(id, params);
  }
}
