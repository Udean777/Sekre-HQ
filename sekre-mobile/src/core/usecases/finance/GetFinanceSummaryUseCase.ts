import type { IFinanceRepository, SummaryFilter } from '@core/ports/IFinanceRepository';
import type { FinanceSummary } from '@core/domain/entities/Transaction';

export class GetFinanceSummaryUseCase {
  constructor(private readonly financeRepository: IFinanceRepository) {}

  async execute(filter?: SummaryFilter): Promise<FinanceSummary> {
    return this.financeRepository.getSummary(filter);
  }
}
