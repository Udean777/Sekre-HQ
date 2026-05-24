import type { IFinanceRepository } from '@core/ports/IFinanceRepository';
import type { TransactionPage, TransactionFilter } from '@core/domain/entities/Transaction';

export class GetTransactionsUseCase {
  constructor(private readonly financeRepository: IFinanceRepository) {}

  async execute(filter?: TransactionFilter): Promise<TransactionPage> {
    return this.financeRepository.getTransactions(filter);
  }
}
