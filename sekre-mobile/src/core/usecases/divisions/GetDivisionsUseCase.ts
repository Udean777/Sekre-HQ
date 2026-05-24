import type { IDivisionRepository } from '@core/ports/IDivisionRepository';
import type { DivisionPage, DivisionFilter } from '@core/domain/entities/Division';

export class GetDivisionsUseCase {
  constructor(private readonly divisionRepository: IDivisionRepository) {}

  async execute(filter?: DivisionFilter): Promise<DivisionPage> {
    return this.divisionRepository.getDivisions(filter);
  }
}
