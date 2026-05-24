import type { AxiosInstance } from 'axios';
import type {
  IFinanceRepository,
  CreateTransactionParams,
  UpdateTransactionParams,
  SummaryFilter,
} from '@core/ports/IFinanceRepository';
import type {
  Transaction,
  TransactionId,
  TransactionFilter,
  TransactionPage,
  FinanceSummary,
} from '@core/domain/entities/Transaction';
import { ENDPOINTS } from '@data/http/endpoints';
import type {
  TransactionListResponseDTO,
  TransactionResponseDTO,
  FinanceSummaryResponseDTO,
  CreateTransactionRequestDTO,
  UpdateTransactionRequestDTO,
} from '@data/dto/finance.dto';
import {
  mapTransactionListDTOToPage,
  mapTransactionDTOToEntity,
  mapFinanceSummaryDTOToEntity,
} from '@data/mappers/finance.mapper';

export class FinanceRepositoryImpl implements IFinanceRepository {
  constructor(private readonly http: AxiosInstance) {}

  async getTransactions(filter?: TransactionFilter): Promise<TransactionPage> {
    const params: Record<string, string | number> = {};
    if (filter?.divisionId) params['division_id'] = filter.divisionId;
    if (filter?.type) params['type'] = filter.type;
    if (filter?.startDate) params['start_date'] = filter.startDate;
    if (filter?.endDate) params['end_date'] = filter.endDate;
    if (filter?.search) params['search'] = filter.search;
    if (filter?.minAmount !== undefined) params['min_amount'] = filter.minAmount;
    if (filter?.maxAmount !== undefined) params['max_amount'] = filter.maxAmount;
    if (filter?.page) params['page'] = filter.page;
    if (filter?.pageSize) params['page_size'] = filter.pageSize;

    const { data } = await this.http.get<TransactionListResponseDTO>(
      ENDPOINTS.FINANCE.TRANSACTIONS_LIST,
      { params },
    );
    return mapTransactionListDTOToPage(data);
  }

  async getTransactionById(id: TransactionId): Promise<Transaction> {
    const { data } = await this.http.get<TransactionResponseDTO>(
      ENDPOINTS.FINANCE.TRANSACTION_DETAIL(id),
    );
    return mapTransactionDTOToEntity(data.data);
  }

  async createTransaction(params: CreateTransactionParams): Promise<Transaction> {
    const payload: CreateTransactionRequestDTO = {
      division_id: params.divisionId,
      type: params.type,
      amount_cents: params.amountCents,
      description: params.description,
      ...(params.eventId !== undefined && { event_id: params.eventId }),
      ...(params.currency !== undefined && { currency: params.currency }),
      ...(params.receiptUrl !== undefined && { receipt_url: params.receiptUrl }),
    };
    const { data } = await this.http.post<TransactionResponseDTO>(
      ENDPOINTS.FINANCE.TRANSACTION_CREATE,
      payload,
    );
    return mapTransactionDTOToEntity(data.data);
  }

  async updateTransaction(
    id: TransactionId,
    params: UpdateTransactionParams,
  ): Promise<Transaction> {
    const payload: UpdateTransactionRequestDTO = {
      ...(params.divisionId !== undefined && { division_id: params.divisionId }),
      ...(params.eventId !== undefined && { event_id: params.eventId }),
      ...(params.type !== undefined && { type: params.type }),
      ...(params.amountCents !== undefined && { amount_cents: params.amountCents }),
      ...(params.currency !== undefined && { currency: params.currency }),
      ...(params.description !== undefined && { description: params.description }),
      ...(params.receiptUrl !== undefined && { receipt_url: params.receiptUrl }),
    };
    const { data } = await this.http.put<TransactionResponseDTO>(
      ENDPOINTS.FINANCE.TRANSACTION_UPDATE(id),
      payload,
    );
    return mapTransactionDTOToEntity(data.data);
  }

  async deleteTransaction(id: TransactionId): Promise<void> {
    await this.http.delete(ENDPOINTS.FINANCE.TRANSACTION_DELETE(id));
  }

  async getSummary(filter?: SummaryFilter): Promise<FinanceSummary> {
    const params: Record<string, string> = {};
    if (filter?.divisionId) params['division_id'] = filter.divisionId;
    if (filter?.startDate) params['start_date'] = filter.startDate;
    if (filter?.endDate) params['end_date'] = filter.endDate;

    const { data } = await this.http.get<FinanceSummaryResponseDTO>(ENDPOINTS.FINANCE.SUMMARY, {
      params,
    });
    return mapFinanceSummaryDTOToEntity(data);
  }
}
