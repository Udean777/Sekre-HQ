package org.sekre_mobile.com.domain.usecase.event

import org.sekre_mobile.com.domain.entity.EventWithDivision
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.EventRepository

class UpdateEventUseCase(
    private val eventRepository: EventRepository,
) {
    suspend operator fun invoke(
        id: String,
        title: String?,
        description: String?,
        startTime: Long?,
        endTime: Long?,
        location: String?,
    ): Result<EventWithDivision> {
        if (id.isBlank()) return Result.Error(Exception("Event id is required"))
        return eventRepository.updateEvent(id, title, description, startTime, endTime, location)
    }
}
