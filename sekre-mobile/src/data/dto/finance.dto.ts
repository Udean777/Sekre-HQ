// Backend response shapes (snake_case)

export interface MoneyDTO {
  amount_cents: number;
  currency: string;
}

export interface TransactionDTO {
  id: string;
  organization_id: string;
  division_id: string;
  event_id: string | null;
  type: 'INCOME' | 'EXPENSE';
  amount: MoneyDTO;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requested_by: string;
  approved_by: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransactionListResponseDTO {
  success: boolean;
  message: string;
  data: {
    data: TransactionDTO[];
    pagination: {
      page: number;
      page_size: number;
      total_items: number;
      total_pages: number;
    };
  };
}

export interface TransactionResponseDTO {
  success: boolean;
  message: string;
  data: TransactionDTO;
}

export interface FinanceSummaryResponseDTO {
  success: boolean;
  message: string;
  data: FinanceSummaryDTO;
}

export interface FinanceSummaryDTO {
  total_income: MoneyDTO;
  total_expense: MoneyDTO;
  balance: MoneyDTO;
}

// Request shapes
export interface CreateTransactionRequestDTO {
  division_id: string;
  event_id?: string;
  type: 'INCOME' | 'EXPENSE';
  amount_cents: number;
  currency?: string;
  description: string;
  receipt_url?: string;
}

export interface UpdateTransactionRequestDTO {
  division_id?: string;
  event_id?: string;
  type?: 'INCOME' | 'EXPENSE';
  amount_cents?: number;
  currency?: string;
  description?: string;
  receipt_url?: string;
}
