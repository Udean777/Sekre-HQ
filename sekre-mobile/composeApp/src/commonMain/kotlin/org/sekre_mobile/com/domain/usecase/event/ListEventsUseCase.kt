package org.sekre_mobile.com.domain.usecase.event

import org.sekre_mobile.com.domain.entity.EventWithDivision
import org.sekre_mobile.com.domain.model.PaginatedResult
import org.sekre_mobile.com.domain.model.PaginationParams
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.EventRepository

/**
 * List Events Use Case
 * Application layer - orchestrates business logic
 */
class ListEventsUseCase(
    private val eventRepository: EventRepository
) {
    suspend operator fun invoke(
        divisionId: String? = null,
        pagination: PaginationParams = PaginationParams(),
    ): Result<PaginatedResult<EventWithDivision>> {
        return eventRepository.listEvents(
            divisionId = divisionId,
            pagination = pagination,
        )
    }
}
