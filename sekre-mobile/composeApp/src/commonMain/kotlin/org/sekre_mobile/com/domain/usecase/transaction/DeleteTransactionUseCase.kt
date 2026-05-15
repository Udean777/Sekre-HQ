package org.sekre_mobile.com.domain.usecase.transaction

import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.TransactionRepository

class DeleteTransactionUseCase(
    private val transactionRepository: TransactionRepository,
) {
    suspend operator fun invoke(id: String): Result<Unit> {
        if (id.isBlank()) return Result.Error(Exception("Transaction id is required"))
        return transactionRepository.deleteTransaction(id)
    }
}
