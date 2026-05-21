import type { IFinanceRepository, UpdateTransactionParams } from '@core/ports/IFinanceRepository';
import type { Transaction, TransactionId } from '@core/domain/entities/Transaction';

export class UpdateTransactionUseCase {
  constructor(private readonly financeRepository: IFinanceRepository) {}

  async execute(id: TransactionId, params: UpdateTransactionParams): Promise<Transaction> {
    return this.financeRepository.updateTransaction(id, params);
  }
}
