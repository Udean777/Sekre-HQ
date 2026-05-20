package org.sekre_mobile.com.presentation.event

import org.sekre_mobile.com.domain.entity.Division
import org.sekre_mobile.com.domain.entity.EventWithDivision
import org.sekre_mobile.com.presentation.base.ViewEffect
import org.sekre_mobile.com.presentation.base.ViewEvent
import org.sekre_mobile.com.presentation.base.ViewState

data class EventState(
    val isLoading: Boolean = false,
    val isLoadingMore: Boolean = false,
    val events: List<EventWithDivision> = emptyList(),
    val page: Int = 1,
    val pageSize: Int = 20,
    val hasMore: Boolean = true,
    val total: Int = 0,
    val errorMessage: String? = null,
    val selectedEvent: EventWithDivision? = null,

    // Division picker support (mirrors TaskState).
    val divisions: List<Division> = emptyList(),
    val isLoadingDivisions: Boolean = false,
) : ViewState

sealed interface EventEvent : ViewEvent {
    data object Load : EventEvent
    data object LoadNextPage : EventEvent
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
        val divisionId: String,
        val title: String,
        val description: String?,
        val startTime: Long,
        val endTime: Long,
        val location: String?,
    ) : EventEvent

    data class SubmitDelete(val id: String) : EventEvent
}

sealed interface EventEffect : ViewEffect {
    data class ShowError(val message: String) : EventEffect
    data object DeletedSuccessfully : EventEffect
    data object UpdatedSuccessfully : EventEffect
}
