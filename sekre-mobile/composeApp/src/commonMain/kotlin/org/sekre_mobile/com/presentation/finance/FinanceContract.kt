package org.sekre_mobile.com.presentation.finance

import org.sekre_mobile.com.domain.entity.Division
import org.sekre_mobile.com.domain.entity.EventWithDivision
import org.sekre_mobile.com.domain.entity.FinanceSummary
import org.sekre_mobile.com.domain.entity.TransactionType
import org.sekre_mobile.com.domain.entity.TransactionWithDetails
import org.sekre_mobile.com.presentation.base.ViewEffect
import org.sekre_mobile.com.presentation.base.ViewEvent
import org.sekre_mobile.com.presentation.base.ViewState

data class FinanceState(
    val isLoading: Boolean = false,
    val isLoadingMore: Boolean = false,
    val transactions: List<TransactionWithDetails> = emptyList(),
    val summary: FinanceSummary? = null,
    val selectedTransaction: TransactionWithDetails? = null,
    val errorMessage: String? = null,

    // Pagination
    val page: Int = 1,
    val pageSize: Int = 20,
    val hasMore: Boolean = true,
    val total: Int = 0,

    // Picker support (mirrors Tasks/Events).
    val divisions: List<Division> = emptyList(),
    val isLoadingDivisions: Boolean = false,
    /** Events for the currently selected division, used by the create form. */
    val divisionEvents: List<EventWithDivision> = emptyList(),
    val isLoadingDivisionEvents: Boolean = false,
) : ViewState

sealed interface FinanceEvent : ViewEvent {
    data object Load : FinanceEvent
    data object LoadNextPage : FinanceEvent
    data class OpenDetail(val id: String) : FinanceEvent

    /** Triggered by create form when the user picks a division so the optional
     *  event linker dropdown can populate. */
    data class LoadDivisionEvents(val divisionId: String) : FinanceEvent

    data class SubmitCreate(
        val divisionId: String,
        val eventId: String?,
        val type: TransactionType,
        val amountCents: Long,
        val description: String,
        val receiptUrl: String?,
    ) : FinanceEvent

    data class SubmitEdit(
        val id: String,
        val type: TransactionType,
        val amountCents: Long,
        val description: String,
        val receiptUrl: String?,
    ) : FinanceEvent

    data class SubmitDelete(val id: String) : FinanceEvent
}

sealed interface FinanceEffect : ViewEffect {
    data class ShowError(val message: String) : FinanceEffect
    data object DeletedSuccessfully : FinanceEffect
}
