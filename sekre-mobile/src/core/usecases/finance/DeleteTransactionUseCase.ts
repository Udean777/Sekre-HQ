import type { IFinanceRepository } from '@core/ports/IFinanceRepository';
import type { TransactionId } from '@core/domain/entities/Transaction';

export class DeleteTransactionUseCase {
  constructor(private readonly financeRepository: IFinanceRepository) {}

  async execute(id: TransactionId): Promise<void> {
    return this.financeRepository.deleteTransaction(id);
  }
}
