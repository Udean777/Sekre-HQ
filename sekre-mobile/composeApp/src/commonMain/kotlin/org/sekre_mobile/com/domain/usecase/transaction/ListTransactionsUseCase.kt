package org.sekre_mobile.com.domain.usecase.transaction

import org.sekre_mobile.com.domain.entity.TransactionType
import org.sekre_mobile.com.domain.entity.TransactionWithDetails
import org.sekre_mobile.com.domain.model.PaginatedResult
import org.sekre_mobile.com.domain.model.PaginationParams
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.TransactionRepository

class ListTransactionsUseCase(
    private val transactionRepository: TransactionRepository,
) {
    suspend operator fun invoke(
        divisionId: String? = null,
        type: TransactionType? = null,
        startDate: String? = null,
        endDate: String? = null,
        pagination: PaginationParams = PaginationParams(),
    ): Result<PaginatedResult<TransactionWithDetails>> {
        return transactionRepository.listTransactions(
            divisionId = divisionId,
            type = type,
            startDate = startDate,
            endDate = endDate,
            pagination = pagination,
        )
    }
}
