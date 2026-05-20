package org.sekre_mobile.com.domain.repository

import org.sekre_mobile.com.domain.entity.FinanceSummary
import org.sekre_mobile.com.domain.entity.TransactionType
import org.sekre_mobile.com.domain.entity.TransactionWithDetails
import org.sekre_mobile.com.domain.model.PaginatedResult
import org.sekre_mobile.com.domain.model.PaginationParams
import org.sekre_mobile.com.domain.model.Result

/** Transaction Repository Interface Domain layer - defines contract for data access. */
interface TransactionRepository {
    /** Create a new transaction. Backend auto-approves the record on success. */
    suspend fun createTransaction(
        divisionId: String,
        type: TransactionType,
        amountCents: Long,
        description: String,
        currency: String,
        eventId: String?,
        receiptUrl: String?,
    ): Result<TransactionWithDetails>

    /** Get transaction by ID. */
    suspend fun getTransactionById(id: String): Result<TransactionWithDetails>

    /**
     * List transactions with optional filters and pagination. `startDate` and
     * `endDate` follow the backend's `YYYY-MM-DD` format (the server explicitly
     * rejects other formats).
     */
    suspend fun listTransactions(
        divisionId: String? = null,
        type: TransactionType? = null,
        startDate: String? = null,
        endDate: String? = null,
        pagination: PaginationParams = PaginationParams(),
    ): Result<PaginatedResult<TransactionWithDetails>>

    /**
     * Update a transaction. Backend reuses CreateTransactionRequest so all of
     * `type`, `amountCents`, and `description` are mandatory. The backend
     * forbids updates while the record is in a terminal status (APPROVED /
     * REJECTED) — this method may return an error in that case.
     */
    suspend fun updateTransaction(
        id: String,
        type: TransactionType,
        amountCents: Long,
        description: String,
        currency: String,
        receiptUrl: String?,
    ): Result<TransactionWithDetails>

    /** Delete a transaction. */
    suspend fun deleteTransaction(id: String): Result<Unit>

    /** Get finance summary. Optional date range uses `YYYY-MM-DD`. */
    suspend fun getFinanceSummary(
        divisionId: String? = null,
        startDate: String? = null,
        endDate: String? = null,
    ): Result<FinanceSummary>
}
