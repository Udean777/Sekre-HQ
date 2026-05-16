package org.sekre_mobile.com.presentation.event

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.usecase.event.CreateEventUseCase
import org.sekre_mobile.com.domain.usecase.event.DeleteEventUseCase
import org.sekre_mobile.com.domain.usecase.event.GetEventByIdUseCase
import org.sekre_mobile.com.domain.usecase.event.ListEventsUseCase
import org.sekre_mobile.com.domain.usecase.event.UpdateEventUseCase
import org.sekre_mobile.com.presentation.base.BaseViewModel
import org.sekre_mobile.com.domain.util.currentTimeMillis

class EventViewModel(
    private val listEventsUseCase: ListEventsUseCase,
    private val getEventByIdUseCase: GetEventByIdUseCase,
    private val createEventUseCase: CreateEventUseCase,
    private val updateEventUseCase: UpdateEventUseCase,
    private val deleteEventUseCase: DeleteEventUseCase,
) : BaseViewModel<EventState, EventEvent, EventEffect>(EventState()) {
    override fun onEvent(event: EventEvent) {
        when (event) {
            EventEvent.Load -> load()
            is EventEvent.OpenDetail -> openDetail(event.id)
            is EventEvent.SubmitCreate -> submitCreate(event)
            is EventEvent.SubmitEdit -> submitEdit(event)
            is EventEvent.SubmitDelete -> submitDelete(event.id)
            is EventEvent.SeedCreateFormFromNow -> seedCreateForm(event.divisionId)
        }
    }

    private fun seedCreateForm(divisionId: String) {
        val now = currentTimeMillis()
        val end = now + 60 * 60 * 1000
        setState {
            it.copy(
                createDivisionId = divisionId,
                createStartTime = now.toString(),
                createEndTime = end.toString(),
            )
        }
    }

    private fun load() = viewModelScope.launch {
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (val result = listEventsUseCase()) {
            is Result.Success -> setState { it.copy(isLoading = false, events = result.data) }
            is Result.Error -> handleError(result.exception.message ?: "Failed to load events")
        }
    }

    private fun openDetail(id: String) = viewModelScope.launch {
        when (val result = getEventByIdUseCase(id)) {
            is Result.Success -> setState { it.copy(selectedEvent = result.data) }
            is Result.Error -> handleError(
                result.exception.message ?: "Failed to load event detail"
            )
        }
    }

    private fun submitCreate(event: EventEvent.SubmitCreate) = viewModelScope.launch {
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (
            val result = createEventUseCase(
                event.divisionId,
                event.title,
                event.description,
                event.startTime,
                event.endTime,
                event.location,
            )
        ) {
            is Result.Success -> {
                setState {
                    it.copy(
                        isLoading = false,
                        events = listOf(result.data) + it.events,
                        createTitle = "",
                        createDescription = "",
                        createLocation = "",
                    )
                }
            }

            is Result.Error -> handleError(result.exception.message ?: "Failed to create event")
        }
    }

    private fun submitEdit(event: EventEvent.SubmitEdit) = viewModelScope.launch {
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (
            val result = updateEventUseCase(
                event.id,
                event.title,
                event.description,
                event.startTime,
                event.endTime,
                event.location,
            )
        ) {
            is Result.Success -> {
                val updated = result.data
                setState {
                    it.copy(
                        isLoading = false,
                        selectedEvent = updated,
                        events = it.events.map { item -> if (item.event.id == updated.event.id) updated else item },
                    )
                }
            }

            is Result.Error -> handleError(result.exception.message ?: "Failed to update event")
        }
    }

    private fun submitDelete(id: String) = viewModelScope.launch {
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (val result = deleteEventUseCase(id)) {
            is Result.Success -> {
                setState {
                    it.copy(
                        isLoading = false,
                        selectedEvent = null,
                        events = it.events.filterNot { item -> item.event.id == id },
                    )
                }
            }

            is Result.Error -> handleError(result.exception.message ?: "Failed to delete event")
        }
    }

    private fun handleError(message: String) = viewModelScope.launch {
        setState { it.copy(isLoading = false, errorMessage = message) }
        sendEffect(EventEffect.ShowError(message))
    }
}
