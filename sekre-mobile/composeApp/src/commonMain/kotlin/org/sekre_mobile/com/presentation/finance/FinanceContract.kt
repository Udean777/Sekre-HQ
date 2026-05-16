package org.sekre_mobile.com.presentation.finance

import org.sekre_mobile.com.domain.entity.FinanceSummary
import org.sekre_mobile.com.domain.entity.TransactionType
import org.sekre_mobile.com.domain.entity.TransactionWithDetails
import org.sekre_mobile.com.presentation.base.ViewEffect
import org.sekre_mobile.com.presentation.base.ViewEvent
import org.sekre_mobile.com.presentation.base.ViewState

data class FinanceState(
    val isLoading: Boolean = false,
    val transactions: List<TransactionWithDetails> = emptyList(),
    val summary: FinanceSummary? = null,
    val selectedTransaction: TransactionWithDetails? = null,
    val errorMessage: String? = null,
) : ViewState

sealed interface FinanceEvent : ViewEvent {
    data object Load : FinanceEvent
    data class OpenDetail(val id: String) : FinanceEvent
    data class SubmitCreate(
        val divisionId: String,
        val eventId: String?,
        val type: TransactionType,
        val amountCents: Long,
        val currency: String,
        val description: String,
        val receiptUrl: String?,
    ) : FinanceEvent

    data class SubmitEdit(
        val id: String,
        val type: TransactionType?,
        val amountCents: Long?,
        val currency: String?,
        val description: String?,
        val receiptUrl: String?,
    ) : FinanceEvent

    data class SubmitDelete(val id: String) : FinanceEvent
}

sealed interface FinanceEffect : ViewEffect {
    data class ShowError(val message: String) : FinanceEffect
}
