package org.sekre_mobile.com.presentation.event

import org.sekre_mobile.com.domain.entity.EventWithDivision
import org.sekre_mobile.com.presentation.base.ViewEffect
import org.sekre_mobile.com.presentation.base.ViewEvent
import org.sekre_mobile.com.presentation.base.ViewState

data class EventState(
    val isLoading: Boolean = false,
    val events: List<EventWithDivision> = emptyList(),
    val selectedEvent: EventWithDivision? = null,
    val createDivisionId: String = "",
    val createTitle: String = "",
    val createDescription: String = "",
    val createLocation: String = "",
    val createStartTime: String = "",
    val createEndTime: String = "",
    val errorMessage: String? = null,
) : ViewState

sealed interface EventEvent : ViewEvent {
    data object Load : EventEvent
    data class OpenDetail(val id: String) : EventEvent
    data class SubmitCreate(
        val divisionId: String,
        val title: String,
        val description: String?,
        val startTime: Long,
        val endTime: Long,
        val location: String?,
    ) : EventEvent

    data class SubmitEdit(
        val id: String,
        val title: String?,
        val description: String?,
        val startTime: Long?,
        val endTime: Long?,
        val location: String?,
    ) : EventEvent

    data class SubmitDelete(val id: String) : EventEvent
    data class SeedCreateFormFromNow(val divisionId: String = "") : EventEvent
}

sealed interface EventEffect : ViewEffect {
    data class ShowError(val message: String) : EventEffect
}
