package org.sekre_mobile.com.presentation.finance

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import org.sekre_mobile.com.domain.model.PaginationParams
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.usecase.division.ListDivisionsUseCase
import org.sekre_mobile.com.domain.usecase.event.ListEventsUseCase
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
    private val listDivisionsUseCase: ListDivisionsUseCase,
    private val listEventsUseCase: ListEventsUseCase,
) : BaseViewModel<FinanceState, FinanceEvent, FinanceEffect>(FinanceState()) {
    private fun log(tag: String, msg: String) {
        println("[DEBUG][FinanceViewModel][$tag] $msg")
    }

    init {
        loadDivisions()
    }

    override fun onEvent(event: FinanceEvent) {
        log("onEvent", "event=$event")
        when (event) {
            FinanceEvent.Load -> load()
            FinanceEvent.LoadNextPage -> loadNextPage()
            is FinanceEvent.OpenDetail -> openDetail(event.id)
            is FinanceEvent.LoadDivisionEvents -> loadDivisionEvents(event.divisionId)
            is FinanceEvent.SubmitCreate -> submitCreate(event)
            is FinanceEvent.SubmitEdit -> submitEdit(event)
            is FinanceEvent.SubmitDelete -> submitDelete(event.id)
        }
    }

    private fun loadDivisions() = viewModelScope.launch {
        log("loadDivisions", "start")
        setState { it.copy(isLoadingDivisions = true) }
        when (val result = listDivisionsUseCase()) {
            is Result.Success -> {
                log("loadDivisions", "OK count=${result.data.size}")
                setState { it.copy(isLoadingDivisions = false, divisions = result.data) }
            }
            is Result.Error -> {
                log("loadDivisions", "FAIL message=${result.exception.message}")
                setState { it.copy(isLoadingDivisions = false) }
                sendEffect(
                    FinanceEffect.ShowError(
                        result.exception.message ?: "Failed to load divisions"
                    )
                )
            }
        }
    }

    private fun loadDivisionEvents(divisionId: String) {
        if (divisionId.isBlank()) return
        log("loadDivisionEvents", "start divisionId=$divisionId")
        viewModelScope.launch {
            setState { it.copy(isLoadingDivisionEvents = true, divisionEvents = emptyList()) }
            when (val result = listEventsUseCase(divisionId = divisionId)) {
                is Result.Success -> {
                    log("loadDivisionEvents", "OK count=${result.data.items.size}")
                    setState {
                        it.copy(
                            isLoadingDivisionEvents = false,
                            divisionEvents = result.data.items,
                        )
                    }
                }
                is Result.Error -> {
                    log("loadDivisionEvents", "FAIL message=${result.exception.message}")
                    setState { it.copy(isLoadingDivisionEvents = false) }
                    sendEffect(
                        FinanceEffect.ShowError(
                            result.exception.message ?: "Failed to load events"
                        )
                    )
                }
            }
        }
    }

    private fun load() = viewModelScope.launch {
        log("load", "start")
        setState { it.copy(isLoading = true, errorMessage = null, page = 1) }
        val params = PaginationParams(limit = state.value.pageSize, offset = 0)
        val txResult = listTransactionsUseCase(pagination = params)
        val summaryResult = getFinanceSummaryUseCase()
        log("load", "txResult=${txResult::class.simpleName} summaryResult=${summaryResult::class.simpleName}")
        when {
            txResult is Result.Success && summaryResult is Result.Success -> {
                val pr = txResult.data
                log("load", "OK txCount=${pr.items.size} total=${pr.total}")
                setState {
                    it.copy(
                        isLoading = false,
                        transactions = pr.items,
                        page = pr.page,
                        total = pr.total,
                        hasMore = pr.hasNextPage,
                        summary = summaryResult.data,
                    )
                }
            }
            else -> {
                val message = (txResult as? Result.Error)?.exception?.message
                    ?: (summaryResult as? Result.Error)?.exception?.message
                    ?: "Failed to load finance data"
                log("load", "FAIL message=$message")
                handleError(message, append = false)
            }
        }
    }

    private fun loadNextPage() {
        val current = state.value
        if (!current.hasMore || current.isLoadingMore || current.isLoading) {
            log("loadNextPage", "skipped hasMore=${current.hasMore} isLoadingMore=${current.isLoadingMore} isLoading=${current.isLoading}")
            return
        }
        log("loadNextPage", "start currentPage=${current.page}")
        viewModelScope.launch {
            setState { it.copy(isLoadingMore = true, errorMessage = null) }
            val params = PaginationParams(
                limit = current.pageSize,
                offset = current.page * current.pageSize,
            )
            when (val result = listTransactionsUseCase(pagination = params)) {
                is Result.Success -> {
                    val pr = result.data
                    val merged = (current.transactions + pr.items)
                        .distinctBy { it.transaction.id }
                    log("loadNextPage", "OK newCount=${pr.items.size} merged=${merged.size}")
                    setState {
                        it.copy(
                            isLoadingMore = false,
                            transactions = merged,
                            page = pr.page,
                            total = pr.total,
                            hasMore = pr.hasNextPage,
                        )
                    }
                }
                is Result.Error -> {
                    log("loadNextPage", "FAIL message=${result.exception.message}")
                    handleError(result.exception.message ?: "Failed to load more", append = true)
                }
            }
        }
    }

    private fun openDetail(id: String) = viewModelScope.launch {
        log("openDetail", "start id=$id")
        when (val result = getTransactionByIdUseCase(id)) {
            is Result.Success -> {
                log("openDetail", "OK id=${result.data.transaction.id}")
                setState { it.copy(selectedTransaction = result.data) }
            }
            is Result.Error -> {
                log("openDetail", "FAIL message=${result.exception.message}")
                handleError(
                    result.exception.message ?: "Failed to load transaction detail",
                    append = false,
                )
            }
        }
    }

    private fun submitCreate(event: FinanceEvent.SubmitCreate) = viewModelScope.launch {
        log("submitCreate", "start divisionId=${event.divisionId} type=${event.type} amountCents=${event.amountCents}")
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (
            val result = createTransactionUseCase(
                divisionId = event.divisionId,
                type = event.type,
                amountCents = event.amountCents,
                description = event.description,
                eventId = event.eventId,
                receiptUrl = event.receiptUrl,
            )
        ) {
            is Result.Success -> {
                log("submitCreate", "OK id=${result.data.transaction.id}")
                // Reload from server to get the freshest summary + ordered list.
                load()
            }
            is Result.Error -> {
                log("submitCreate", "FAIL message=${result.exception.message}")
                handleError(
                    result.exception.message ?: "Failed to create transaction",
                    append = false,
                )
            }
        }
    }

    private fun submitEdit(event: FinanceEvent.SubmitEdit) = viewModelScope.launch {
        log("submitEdit", "start id=${event.id} type=${event.type} amountCents=${event.amountCents}")
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (
            val result = updateTransactionUseCase(
                id = event.id,
                type = event.type,
                amountCents = event.amountCents,
                description = event.description,
                receiptUrl = event.receiptUrl,
            )
        ) {
            is Result.Success -> {
                val updated = result.data
                log("submitEdit", "OK id=${updated.transaction.id}")
                setState {
                    it.copy(
                        isLoading = false,
                        selectedTransaction = updated,
                        transactions = it.transactions.map { item ->
                            if (item.transaction.id == updated.transaction.id) updated else item
                        },
                    )
                }
                // Refresh summary in background to reflect the edit.
                refreshSummary()
            }
            is Result.Error -> {
                log("submitEdit", "FAIL message=${result.exception.message}")
                handleError(
                    result.exception.message ?: "Failed to update transaction",
                    append = false,
                )
            }
        }
    }

    private fun submitDelete(id: String) = viewModelScope.launch {
        log("submitDelete", "start id=$id")
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (val result = deleteTransactionUseCase(id)) {
            is Result.Success -> {
                log("submitDelete", "OK id=$id")
                setState {
                    it.copy(
                        isLoading = false,
                        selectedTransaction = null,
                        transactions = it.transactions.filterNot { item ->
                            item.transaction.id == id
                        },
                        total = (it.total - 1).coerceAtLeast(0),
                    )
                }
                refreshSummary()
                sendEffect(FinanceEffect.DeletedSuccessfully)
            }
            is Result.Error -> {
                log("submitDelete", "FAIL message=${result.exception.message}")
                handleError(
                    result.exception.message ?: "Failed to delete transaction",
                    append = false,
                )
            }
        }
    }

    private fun refreshSummary() = viewModelScope.launch {
        when (val result = getFinanceSummaryUseCase()) {
            is Result.Success -> setState { it.copy(summary = result.data) }
            is Result.Error -> Unit // ignore, list is the source of truth
        }
    }

    private fun handleError(message: String, append: Boolean) = viewModelScope.launch {
        log("handleError", "message=$message append=$append")
        setState { it.copy(isLoading = false, isLoadingMore = false, errorMessage = message) }
        sendEffect(FinanceEffect.ShowError(if (append) "Append error: $message" else message))
    }
}
