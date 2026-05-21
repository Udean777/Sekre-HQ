import type { IFinanceRepository, CreateTransactionParams } from '@core/ports/IFinanceRepository';
import type { Transaction } from '@core/domain/entities/Transaction';

export class CreateTransactionUseCase {
  constructor(private readonly financeRepository: IFinanceRepository) {}

  async execute(params: CreateTransactionParams): Promise<Transaction> {
    return this.financeRepository.createTransaction(params);
  }
}
