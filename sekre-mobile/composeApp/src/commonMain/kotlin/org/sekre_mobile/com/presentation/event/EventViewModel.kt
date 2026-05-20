package org.sekre_mobile.com.presentation.event

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import org.sekre_mobile.com.domain.model.PaginationParams
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.usecase.division.ListDivisionsUseCase
import org.sekre_mobile.com.domain.usecase.event.CreateEventUseCase
import org.sekre_mobile.com.domain.usecase.event.DeleteEventUseCase
import org.sekre_mobile.com.domain.usecase.event.GetEventByIdUseCase
import org.sekre_mobile.com.domain.usecase.event.ListEventsUseCase
import org.sekre_mobile.com.domain.usecase.event.UpdateEventUseCase
import org.sekre_mobile.com.domain.util.ErrorMapper
import org.sekre_mobile.com.presentation.base.BaseViewModel

class EventViewModel(
    private val listEventsUseCase: ListEventsUseCase,
    private val getEventByIdUseCase: GetEventByIdUseCase,
    private val createEventUseCase: CreateEventUseCase,
    private val updateEventUseCase: UpdateEventUseCase,
    private val deleteEventUseCase: DeleteEventUseCase,
    private val listDivisionsUseCase: ListDivisionsUseCase,
) : BaseViewModel<EventState, EventEvent, EventEffect>(EventState()) {
    private fun log(tag: String, msg: String) {
        println("[DEBUG][EventViewModel][$tag] $msg")
    }

    init {
        // Pre-load divisions so create/edit forms can populate the dropdown immediately.
        loadDivisions()
    }

    override fun onEvent(event: EventEvent) {
        log("onEvent", "event=$event")
        when (event) {
            EventEvent.Load -> loadFirstPage()
            EventEvent.LoadNextPage -> loadNextPage()
            is EventEvent.OpenDetail -> openDetail(event.id)
            is EventEvent.SubmitCreate -> submitCreate(event)
            is EventEvent.SubmitEdit -> submitEdit(event)
            is EventEvent.SubmitDelete -> submitDelete(event.id)
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
                    EventEffect.ShowError(
                        ErrorMapper.toDisplayMessage("Gagal memuat divisi", result.exception),
                    ),
                )
            }
        }
    }

    private fun loadFirstPage() = viewModelScope.launch {
        log("loadFirstPage", "start")
        setState { it.copy(isLoading = true, errorMessage = null, page = 1) }
        val params = PaginationParams(limit = state.value.pageSize, offset = 0)
        when (val result = listEventsUseCase(pagination = params)) {
            is Result.Success -> {
                val pr = result.data
                log(
                    "loadFirstPage",
                    "OK count=${pr.items.size} total=${pr.total} hasNext=${pr.hasNextPage}"
                )
                setState {
                    it.copy(
                        isLoading = false,
                        events = pr.items,
                        total = pr.total,
                        page = pr.page,
                        hasMore = pr.hasNextPage,
                    )
                }
            }

            is Result.Error -> {
                log("loadFirstPage", "FAIL message=${result.exception.message}")
                handleError(
                    ErrorMapper.toDisplayMessage("Gagal memuat event", result.exception),
                    append = false,
                )
            }
        }
    }

    private fun loadNextPage() {
        val current = state.value
        if (!current.hasMore || current.isLoadingMore || current.isLoading) {
            log(
                "loadNextPage",
                "skipped hasMore=${current.hasMore} isLoadingMore=${current.isLoadingMore} isLoading=${current.isLoading}"
            )
            return
        }
        log("loadNextPage", "start currentPage=${current.page}")
        viewModelScope.launch {
            setState { it.copy(isLoadingMore = true, errorMessage = null) }
            val params = PaginationParams(
                limit = current.pageSize,
                offset = current.page * current.pageSize,
            )
            when (val result = listEventsUseCase(pagination = params)) {
                is Result.Success -> {
                    val pr = result.data
                    val merged = (current.events + pr.items).distinctBy { it.event.id }
                    log(
                        "loadNextPage",
                        "OK newCount=${pr.items.size} merged=${merged.size} total=${pr.total} hasNext=${pr.hasNextPage}"
                    )
                    setState {
                        it.copy(
                            isLoadingMore = false,
                            events = merged,
                            page = pr.page,
                            total = pr.total,
                            hasMore = pr.hasNextPage,
                        )
                    }
                }

                is Result.Error -> {
                    log("loadNextPage", "FAIL message=${result.exception.message}")
                    handleError(
                        ErrorMapper.toDisplayMessage(
                            "Gagal memuat event lainnya",
                            result.exception
                        ),
                        append = true,
                    )
                }
            }
        }
    }

    private fun openDetail(id: String) = viewModelScope.launch {
        log("openDetail", "start id=$id")
        when (val result = getEventByIdUseCase(id)) {
            is Result.Success -> {
                log("openDetail", "OK id=${result.data.event.id}")
                setState { it.copy(selectedEvent = result.data) }
            }

            is Result.Error -> {
                log("openDetail", "FAIL message=${result.exception.message}")
                handleError(
                    ErrorMapper.toDisplayMessage("Gagal memuat detail event", result.exception),
                    append = false,
                )
            }
        }
    }

    private fun submitCreate(event: EventEvent.SubmitCreate) = viewModelScope.launch {
        log("submitCreate", "start divisionId=${event.divisionId} title=${event.title}")
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (
            val result = createEventUseCase(
                divisionId = event.divisionId,
                title = event.title,
                startTime = event.startTime,
                endTime = event.endTime,
                description = event.description,
                location = event.location,
            )
        ) {
            is Result.Success -> {
                log("submitCreate", "OK id=${result.data.event.id}")
                setState {
                    it.copy(
                        isLoading = false,
                        events = listOf(result.data) + it.events,
                    )
                }
            }

            is Result.Error -> {
                log("submitCreate", "FAIL message=${result.exception.message}")
                handleError(
                    ErrorMapper.toDisplayMessage("Gagal membuat event", result.exception),
                    append = false,
                )
            }
        }
    }

    private fun submitEdit(event: EventEvent.SubmitEdit) = viewModelScope.launch {
        log("submitEdit", "start id=${event.id} title=${event.title}")
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (
            val result = updateEventUseCase(
                id = event.id,
                divisionId = event.divisionId,
                title = event.title,
                startTime = event.startTime,
                endTime = event.endTime,
                description = event.description,
                location = event.location,
            )
        ) {
            is Result.Success -> {
                val updated = result.data
                log("submitEdit", "OK id=${updated.event.id}")
                setState {
                    it.copy(
                        isLoading = false,
                        selectedEvent = updated,
                        events = it.events.map { item ->
                            if (item.event.id == updated.event.id) updated else item
                        },
                    )
                }
            }

            is Result.Error -> {
                log("submitEdit", "FAIL message=${result.exception.message}")
                handleError(
                    ErrorMapper.toDisplayMessage("Gagal memperbarui event", result.exception),
                    append = false,
                )
            }
        }
    }

    private fun submitDelete(id: String) = viewModelScope.launch {
        log("submitDelete", "start id=$id")
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (val result = deleteEventUseCase(id)) {
            is Result.Success -> {
                log("submitDelete", "OK id=$id")
                setState {
                    it.copy(
                        isLoading = false,
                        selectedEvent = null,
                        events = it.events.filterNot { item -> item.event.id == id },
                        total = (it.total - 1).coerceAtLeast(0),
                    )
                }
                sendEffect(EventEffect.DeletedSuccessfully)
            }

            is Result.Error -> {
                log("submitDelete", "FAIL message=${result.exception.message}")
                handleError(
                    ErrorMapper.toDisplayMessage("Gagal menghapus event", result.exception),
                    append = false,
                )
            }
        }
    }

    private fun handleError(message: String, append: Boolean) = viewModelScope.launch {
        log("handleError", "message=$message append=$append")
        setState { it.copy(isLoading = false, isLoadingMore = false, errorMessage = message) }
        sendEffect(EventEffect.ShowError(if (append) "Append error: $message" else message))
    }
}
