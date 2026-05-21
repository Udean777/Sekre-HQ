import type { IFinanceRepository } from '@core/ports/IFinanceRepository';
import type { TransactionListResult, TransactionFilter } from '@core/domain/entities/Transaction';

export class GetTransactionsUseCase {
  constructor(private readonly financeRepository: IFinanceRepository) {}

  async execute(filter?: TransactionFilter): Promise<TransactionListResult> {
    return this.financeRepository.getTransactions(filter);
  }
}
