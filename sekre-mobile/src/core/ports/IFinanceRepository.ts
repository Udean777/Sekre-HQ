import type {
  Transaction,
  TransactionId,
  TransactionFilter,
  TransactionListResult,
  FinanceSummary,
} from '@core/domain/entities/Transaction';

export interface CreateTransactionParams {
  divisionId: string;
  eventId?: string;
  type: 'INCOME' | 'EXPENSE';
  amountCents: number;
  currency?: string;
  description: string;
  receiptUrl?: string;
}

export interface UpdateTransactionParams {
  divisionId?: string;
  eventId?: string;
  type?: 'INCOME' | 'EXPENSE';
  amountCents?: number;
  currency?: string;
  description?: string;
  receiptUrl?: string;
}

export interface SummaryFilter {
  divisionId?: string;
  startDate?: string;
  endDate?: string;
}

export interface IFinanceRepository {
  getTransactions(filter?: TransactionFilter): Promise<TransactionListResult>;
  getTransactionById(id: TransactionId): Promise<Transaction>;
  createTransaction(params: CreateTransactionParams): Promise<Transaction>;
  updateTransaction(id: TransactionId, params: UpdateTransactionParams): Promise<Transaction>;
  deleteTransaction(id: TransactionId): Promise<void>;
  getSummary(filter?: SummaryFilter): Promise<FinanceSummary>;
}
