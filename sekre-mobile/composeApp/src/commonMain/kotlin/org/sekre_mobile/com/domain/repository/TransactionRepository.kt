package org.sekre_mobile.com.domain.repository

import org.sekre_mobile.com.domain.entity.FinanceSummary
import org.sekre_mobile.com.domain.entity.TransactionStatus
import org.sekre_mobile.com.domain.entity.TransactionType
import org.sekre_mobile.com.domain.entity.TransactionWithDetails
import org.sekre_mobile.com.domain.model.Result

/** Transaction Repository Interface Domain layer - defines contract for data access */
interface TransactionRepository {
    /** Create a new transaction */
    suspend fun createTransaction(
        divisionId: String,
        eventId: String?,
        type: TransactionType,
        amountCents: Long,
        currency: String,
        description: String,
        receiptUrl: String?
    ): Result<TransactionWithDetails>

    /** Get transaction by ID */
    suspend fun getTransactionById(id: String): Result<TransactionWithDetails>

    /** List transactions with optional filters */
    suspend fun listTransactions(
        divisionId: String? = null,
        type: TransactionType? = null,
        status: TransactionStatus? = null,
        startDate: Long? = null,
        endDate: Long? = null
    ): Result<List<TransactionWithDetails>>

    /** Update transaction */
    suspend fun updateTransaction(
        id: String,
        type: TransactionType?,
        amountCents: Long?,
        currency: String?,
        description: String?,
        receiptUrl: String?
    ): Result<TransactionWithDetails>

    /** Approve or reject transaction */
    suspend fun approveTransaction(id: String, status: TransactionStatus): Result<Unit>

    /** Delete transaction */
    suspend fun deleteTransaction(id: String): Result<Unit>

    /** Get finance summary */
    suspend fun getFinanceSummary(divisionId: String? = null): Result<FinanceSummary>
}
