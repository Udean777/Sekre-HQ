package org.sekre_mobile.com.presentation.finance

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.usecase.transaction.CreateTransactionUseCase
import org.sekre_mobile.com.domain.usecase.transaction.DeleteTransactionUseCase
import org.sekre_mobile.com.domain.usecase.transaction.GetFinanceSummaryUseCase
import org.sekre_mobile.com.domain.usecase.transaction.GetTransactionByIdUseCase
import org.sekre_mobile.com.domain.usecase.transaction.ListTransactionsUseCase
import org.sekre_mobile.com.domain.usecase.transaction.UpdateTransactionUseCase
import org.sekre_mobile.com.presentation.base.BaseViewModel

class FinanceViewModel(
    private val listTransactionsUseCase: ListTransactionsUseCase,
    private val getTransactionByIdUseCase: GetTransactionByIdUseCase,
    private val createTransactionUseCase: CreateTransactionUseCase,
    private val updateTransactionUseCase: UpdateTransactionUseCase,
    private val deleteTransactionUseCase: DeleteTransactionUseCase,
    private val getFinanceSummaryUseCase: GetFinanceSummaryUseCase,
) : BaseViewModel<FinanceState, FinanceEvent, FinanceEffect>(FinanceState()) {
    override fun onEvent(event: FinanceEvent) {
        when (event) {
            FinanceEvent.Load -> load()
            is FinanceEvent.OpenDetail -> openDetail(event.id)
            is FinanceEvent.SubmitCreate -> submitCreate(event)
            is FinanceEvent.SubmitEdit -> submitEdit(event)
            is FinanceEvent.SubmitDelete -> submitDelete(event.id)
        }
    }

    private fun load() = viewModelScope.launch {
        setState { it.copy(isLoading = true, errorMessage = null) }
        val txResult = listTransactionsUseCase()
        val summaryResult = getFinanceSummaryUseCase()
        if (txResult is Result.Success && summaryResult is Result.Success) {
            setState {
                it.copy(
                    isLoading = false,
                    transactions = txResult.data,
                    summary = summaryResult.data
                )
            }
        } else {
            val message = (txResult as? Result.Error)?.exception?.message
                ?: (summaryResult as? Result.Error)?.exception?.message
                ?: "Failed to load finance data"
            handleError(message)
        }
    }

    private fun openDetail(id: String) = viewModelScope.launch {
        when (val result = getTransactionByIdUseCase(id)) {
            is Result.Success -> setState { it.copy(selectedTransaction = result.data) }
            is Result.Error -> handleError(
                result.exception.message ?: "Failed to load transaction detail"
            )
        }
    }

    private fun submitCreate(event: FinanceEvent.SubmitCreate) = viewModelScope.launch {
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (val result = createTransactionUseCase(
            event.divisionId,
            event.eventId,
            event.type,
            event.amountCents,
            event.currency,
            event.description,
            event.receiptUrl
        )) {
            is Result.Success -> {
                setState {
                    it.copy(
                        isLoading = false,
                        transactions = listOf(result.data) + it.transactions
                    )
                }
                load()
            }

            is Result.Error -> handleError(
                result.exception.message ?: "Failed to create transaction"
            )
        }
    }

    private fun submitEdit(event: FinanceEvent.SubmitEdit) = viewModelScope.launch {
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (val result = updateTransactionUseCase(
            event.id,
            event.type,
            event.amountCents,
            event.currency,
            event.description,
            event.receiptUrl
        )) {
            is Result.Success -> {
                val updated = result.data
                setState {
                    it.copy(
                        isLoading = false,
                        selectedTransaction = updated,
                        transactions = it.transactions.map { item -> if (item.transaction.id == updated.transaction.id) updated else item },
                    )
                }
                load()
            }

            is Result.Error -> handleError(
                result.exception.message ?: "Failed to update transaction"
            )
        }
    }

    private fun submitDelete(id: String) = viewModelScope.launch {
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (val result = deleteTransactionUseCase(id)) {
            is Result.Success -> {
                setState {
                    it.copy(
                        isLoading = false,
                        selectedTransaction = null,
                        transactions = it.transactions.filterNot { item -> item.transaction.id == id },
                    )
                }
                load()
            }

            is Result.Error -> handleError(
                result.exception.message ?: "Failed to delete transaction"
            )
        }
    }

    private fun handleError(message: String) = viewModelScope.launch {
        setState { it.copy(isLoading = false, errorMessage = message) }
        sendEffect(FinanceEffect.ShowError(message))
    }
}
