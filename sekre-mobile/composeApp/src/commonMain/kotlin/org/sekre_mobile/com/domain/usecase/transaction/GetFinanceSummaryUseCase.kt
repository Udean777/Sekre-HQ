package org.sekre_mobile.com.domain.usecase.transaction

import org.sekre_mobile.com.domain.entity.FinanceSummary
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.TransactionRepository

/** Get Finance Summary Use Case Application layer - orchestrates business logic */
class GetFinanceSummaryUseCase(private val transactionRepository: TransactionRepository) {
    suspend operator fun invoke(divisionId: String? = null): Result<FinanceSummary> {
        return transactionRepository.getFinanceSummary(divisionId)
    }
}
