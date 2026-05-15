package org.sekre_mobile.com.domain.usecase.transaction

import org.sekre_mobile.com.domain.entity.TransactionType
import org.sekre_mobile.com.domain.entity.TransactionWithDetails
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.TransactionRepository

class UpdateTransactionUseCase(
    private val transactionRepository: TransactionRepository,
) {
    suspend operator fun invoke(
        id: String,
        type: TransactionType?,
        amountCents: Long?,
        currency: String?,
        description: String?,
        receiptUrl: String?,
    ): Result<TransactionWithDetails> {
        if (id.isBlank()) return Result.Error(Exception("Transaction id is required"))
        return transactionRepository.updateTransaction(id, type, amountCents, currency, description, receiptUrl)
    }
}
