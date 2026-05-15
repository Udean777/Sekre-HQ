package org.sekre_mobile.com.domain.usecase.event

import org.sekre_mobile.com.domain.entity.EventWithDivision
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.EventRepository

class GetEventByIdUseCase(
    private val eventRepository: EventRepository,
) {
    suspend operator fun invoke(id: String): Result<EventWithDivision> {
        if (id.isBlank()) return Result.Error(Exception("Event id is required"))
        return eventRepository.getEventById(id)
    }
}
