package org.sekre_mobile.com.domain.usecase.transaction

import org.sekre_mobile.com.domain.entity.TransactionStatus
import org.sekre_mobile.com.domain.entity.TransactionType
import org.sekre_mobile.com.domain.entity.TransactionWithDetails
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.TransactionRepository

class ListTransactionsUseCase(
    private val transactionRepository: TransactionRepository,
) {
    suspend operator fun invoke(
        divisionId: String? = null,
        type: TransactionType? = null,
        status: TransactionStatus? = null,
        startDate: Long? = null,
        endDate: Long? = null,
    ): Result<List<TransactionWithDetails>> {
        return transactionRepository.listTransactions(divisionId, type, status, startDate, endDate)
    }
}
