package org.sekre_mobile.com.domain.usecase.event

import org.sekre_mobile.com.domain.entity.EventWithDivision
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.EventRepository

/**
 * Create Event Use Case
 * Application layer - orchestrates business logic
 */
class CreateEventUseCase(
    private val eventRepository: EventRepository
) {
    suspend operator fun invoke(
        divisionId: String,
        title: String,
        startTime: Long,
        endTime: Long,
        description: String?,
        location: String?,
    ): Result<EventWithDivision> {
        if (title.isBlank()) return Result.Error(Exception("Title is required"))
        if (title.length > 200) return Result.Error(Exception("Title must be less than 200 characters"))
        if (divisionId.isBlank()) return Result.Error(Exception("Division is required"))
        if (startTime >= endTime) return Result.Error(Exception("End time must be after start time"))

        return eventRepository.createEvent(
            divisionId = divisionId,
            title = title,
            startTime = startTime,
            endTime = endTime,
            description = description,
            location = location,
        )
    }
}
