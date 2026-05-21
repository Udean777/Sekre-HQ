import type { IDivisionRepository, CreateDivisionParams } from '@core/ports/IDivisionRepository';
import type { Division } from '@core/domain/entities/Division';

export class CreateDivisionUseCase {
  constructor(private readonly divisionRepository: IDivisionRepository) {}

  async execute(params: CreateDivisionParams): Promise<Division> {
    return this.divisionRepository.createDivision(params);
  }
}
