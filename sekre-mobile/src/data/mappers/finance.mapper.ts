import type {
  Transaction,
  TransactionId,
  TransactionListResult,
  FinanceSummary,
  Money,
} from '@core/domain/entities/Transaction';
import type {
  TransactionDTO,
  TransactionListResponseDTO,
  FinanceSummaryDTO,
  MoneyDTO,
} from '@data/dto/finance.dto';

export const mapMoneyDTOToEntity = (dto: MoneyDTO): Money => ({
  amountCents: dto.amount_cents,
  currency: dto.currency,
});

export const mapTransactionDTOToEntity = (dto: TransactionDTO): Transaction => ({
  id: dto.id as TransactionId,
  organizationId: dto.organization_id,
  divisionId: dto.division_id,
  eventId: dto.event_id,
  type: dto.type,
  amount: mapMoneyDTOToEntity(dto.amount),
  description: dto.description,
  status: dto.status,
  requestedBy: dto.requested_by,
  approvedBy: dto.approved_by,
  receiptUrl: dto.receipt_url,
  createdAt: new Date(dto.created_at),
  updatedAt: new Date(dto.updated_at),
});

export const mapTransactionListDTOToResult = (
  dto: TransactionListResponseDTO,
): TransactionListResult => ({
  transactions: dto.data.map(mapTransactionDTOToEntity),
  total: dto.pagination.total,
  page: dto.pagination.page,
  pageSize: dto.pagination.page_size,
});

export const mapFinanceSummaryDTOToEntity = (dto: FinanceSummaryDTO): FinanceSummary => ({
  totalIncome: mapMoneyDTOToEntity(dto.total_income),
  totalExpense: mapMoneyDTOToEntity(dto.total_expense),
  balance: mapMoneyDTOToEntity(dto.balance),
});
