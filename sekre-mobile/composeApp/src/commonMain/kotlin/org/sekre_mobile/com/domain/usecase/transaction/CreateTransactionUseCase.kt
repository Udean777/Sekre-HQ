package org.sekre_mobile.com.domain.usecase.transaction

import org.sekre_mobile.com.domain.entity.TransactionType
import org.sekre_mobile.com.domain.entity.TransactionWithDetails
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.TransactionRepository

/**
 * Create Transaction Use Case
 * Application layer - orchestrates business logic
 */
class CreateTransactionUseCase(
    private val transactionRepository: TransactionRepository,
) {
    suspend operator fun invoke(
        divisionId: String,
        type: TransactionType,
        amountCents: Long,
        description: String,
        currency: String = "IDR",
        eventId: String? = null,
        receiptUrl: String? = null,
    ): Result<TransactionWithDetails> {
        if (divisionId.isBlank()) return Result.Error(Exception("Division is required"))
        if (amountCents <= 0L) return Result.Error(Exception("Amount must be greater than 0"))
        if (description.isBlank()) return Result.Error(Exception("Description is required"))
        if (description.length > 1000) {
            return Result.Error(Exception("Description must be less than 1000 characters"))
        }

        return transactionRepository.createTransaction(
            divisionId = divisionId,
            type = type,
            amountCents = amountCents,
            description = description,
            currency = currency,
            eventId = eventId,
            receiptUrl = receiptUrl,
        )
    }
}
