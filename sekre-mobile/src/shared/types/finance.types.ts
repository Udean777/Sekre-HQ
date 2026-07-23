export type TransactionType = "INCOME" | "EXPENSE";

export interface Money {
  amount_cents: number;
  currency: string;
}

export interface Transaction {
  id: string;
  organization_id: string;
  division_id: string;
  event_id: string | null;
  type: TransactionType;
  amount: Money;
  description: string;
  receipt_url: string | null;
  requested_by: string;
  created_at: string;
  updated_at: string;
}

export interface FinanceSummary {
  organization_id: string;
  division_id: string | null;
  total_income: Money;
  total_expense: Money;
  balance: Money;
}

export interface CreateTransactionRequest {
  division_id: string;
  event_id?: string | null;
  type: TransactionType;
  amount_cents: number;
  currency?: string;
  description: string;
  receipt_url?: string | null;
}

export interface UpdateTransactionRequest {
  type: TransactionType;
  amount_cents: number;
  currency?: string;
  description: string;
  receipt_url?: string | null;
}

export interface TransactionFilters {
  division_id?: string;
  type?: TransactionType;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  search?: string;
  min_amount?: number;
  max_amount?: number;
  page?: number;
  page_size?: number;
}
