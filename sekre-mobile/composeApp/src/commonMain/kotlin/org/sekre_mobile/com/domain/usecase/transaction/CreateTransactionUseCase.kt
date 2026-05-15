package org.sekre_mobile.com.domain.usecase.transaction

import org.sekre_mobile.com.domain.entity.TransactionStatus
import org.sekre_mobile.com.domain.entity.TransactionType
import org.sekre_mobile.com.domain.entity.TransactionWithDetails
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.TransactionRepository

/**
 * Create Transaction Use Case
 * Application layer - orchestrates business logic
 */
class CreateTransactionUseCase(
    private val transactionRepository: TransactionRepository
) {
    suspend operator fun invoke(
        divisionId: String,
        eventId: String?,
        type: TransactionType,
        amount: Double,
        description: String,
        receiptUrl: String?
    ): Result<TransactionWithDetails> {
        // Validate input
        if (divisionId.isBlank()) {
            return Result.Error(Exception("Division is required"))
        }
        if (amount <= 0) {
            return Result.Error(Exception("Amount must be greater than 0"))
        }
        if (description.isBlank()) {
            return Result.Error(Exception("Description is required"))
        }
        if (description.length > 1000) {
            return Result.Error(Exception("Description must be less than 1000 characters"))
        }

        // Create transaction via repository
        return transactionRepository.createTransaction(
            divisionId = divisionId,
            eventId = eventId,
            type = type,
            amount = amount,
            description = description,
            receiptUrl = receiptUrl
        )
    }
}
