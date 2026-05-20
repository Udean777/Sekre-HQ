package org.sekre_mobile.com.domain.usecase.transaction

import org.sekre_mobile.com.domain.entity.TransactionType
import org.sekre_mobile.com.domain.entity.TransactionWithDetails
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.TransactionRepository

/**
 * Update Transaction Use Case.
 *
 * Backend `PUT /transactions/{id}` reuses CreateTransactionRequest, so all of
 * `type`, `amountCents`, and `description` are mandatory. The backend forbids
 * updates while the record is APPROVED/REJECTED — callers should treat that as
 * a domain error.
 */
class UpdateTransactionUseCase(
    private val transactionRepository: TransactionRepository,
) {
    suspend operator fun invoke(
        id: String,
        type: TransactionType,
        amountCents: Long,
        description: String,
        currency: String = "IDR",
        receiptUrl: String? = null,
    ): Result<TransactionWithDetails> {
        if (id.isBlank()) return Result.Error(Exception("Transaction id is required"))
        if (amountCents <= 0L) return Result.Error(Exception("Amount must be greater than 0"))
        if (description.isBlank()) return Result.Error(Exception("Description is required"))
        if (description.length > 1000) {
            return Result.Error(Exception("Description must be less than 1000 characters"))
        }

        return transactionRepository.updateTransaction(
            id = id,
            type = type,
            amountCents = amountCents,
            description = description,
            currency = currency,
            receiptUrl = receiptUrl,
        )
    }
}
