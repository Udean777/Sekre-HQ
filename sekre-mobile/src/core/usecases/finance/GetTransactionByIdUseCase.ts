import type { IFinanceRepository } from '@core/ports/IFinanceRepository';
import type { Transaction, TransactionId } from '@core/domain/entities/Transaction';

export class GetTransactionByIdUseCase {
  constructor(private readonly financeRepository: IFinanceRepository) {}

  async execute(id: TransactionId): Promise<Transaction> {
    return this.financeRepository.getTransactionById(id);
  }
}
