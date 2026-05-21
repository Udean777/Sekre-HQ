// Branded types untuk type safety
export type TransactionId = string & { __brand: 'TransactionId' };

export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Value object Money
export interface Money {
  amountCents: number;
  currency: string;
}

export interface Transaction {
  id: TransactionId;
  organizationId: string;
  divisionId: string;
  eventId: string | null;
  type: TransactionType;
  amount: Money;
  description: string;
  status: TransactionStatus;
  requestedBy: string;
  approvedBy: string | null;
  receiptUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinanceSummary {
  totalIncome: Money;
  totalExpense: Money;
  balance: Money;
}

export interface TransactionFilter {
  divisionId?: string;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  pageSize?: number;
}

export interface TransactionListResult {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}
