import type { IDivisionRepository } from '@core/ports/IDivisionRepository';
import type { DivisionDetail, DivisionId } from '@core/domain/entities/Division';

export class GetDivisionByIdUseCase {
  constructor(private readonly divisionRepository: IDivisionRepository) {}

  async execute(id: DivisionId): Promise<DivisionDetail> {
    return this.divisionRepository.getDivisionById(id);
  }
}
