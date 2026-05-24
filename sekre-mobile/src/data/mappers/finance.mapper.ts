import type {
  Transaction,
  TransactionId,
  TransactionPage,
  FinanceSummary,
  Money,
} from '@core/domain/entities/Transaction';
import type {
  TransactionDTO,
  TransactionListResponseDTO,
  FinanceSummaryResponseDTO,
  FinanceSummaryDTO,
  MoneyDTO,
} from '@data/dto/finance.dto';
import { mapPaginationMeta } from './pagination.mapper';

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

export const mapTransactionListDTOToPage = (
  dto: TransactionListResponseDTO,
): TransactionPage => ({
  items: dto.data.data.map(mapTransactionDTOToEntity),
  meta: mapPaginationMeta(dto.data.pagination),
});

export const mapFinanceSummaryDTOToEntity = (dto: FinanceSummaryResponseDTO): FinanceSummary =>
  mapFinanceSummaryDataToEntity(dto.data);

export const mapFinanceSummaryDataToEntity = (dto: FinanceSummaryDTO): FinanceSummary => ({
  totalIncome: mapMoneyDTOToEntity(dto.total_income),
  totalExpense: mapMoneyDTOToEntity(dto.total_expense),
  balance: mapMoneyDTOToEntity(dto.balance),
});
