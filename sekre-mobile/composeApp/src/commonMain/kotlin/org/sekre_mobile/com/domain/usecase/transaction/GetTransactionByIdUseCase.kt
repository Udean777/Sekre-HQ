package org.sekre_mobile.com.domain.usecase.transaction

import org.sekre_mobile.com.domain.entity.TransactionWithDetails
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.TransactionRepository

class GetTransactionByIdUseCase(
    private val transactionRepository: TransactionRepository,
) {
    suspend operator fun invoke(id: String): Result<TransactionWithDetails> {
        if (id.isBlank()) return Result.Error(Exception("Transaction id is required"))
        return transactionRepository.getTransactionById(id)
    }
}
