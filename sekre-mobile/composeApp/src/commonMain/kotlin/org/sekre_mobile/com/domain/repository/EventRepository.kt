package org.sekre_mobile.com.domain.repository

import org.sekre_mobile.com.domain.entity.EventWithDivision
import org.sekre_mobile.com.domain.model.PaginatedResult
import org.sekre_mobile.com.domain.model.PaginationParams
import org.sekre_mobile.com.domain.model.Result

/** Event Repository Interface Domain layer - defines contract for data access */
interface EventRepository {
    /** Create a new event */
    suspend fun createEvent(
        divisionId: String,
        title: String,
        startTime: Long,
        endTime: Long,
        description: String?,
        location: String?,
    ): Result<EventWithDivision>

    /** Get event by ID */
    suspend fun getEventById(id: String): Result<EventWithDivision>

    /**
     * List events with optional division filter and pagination.
     *
     * Backend `GET /events` only honours `division_id` plus pagination params today;
     * date filters are intentionally not exposed here to avoid silent no-ops.
     */
    suspend fun listEvents(
        divisionId: String? = null,
        pagination: PaginationParams = PaginationParams(),
    ): Result<PaginatedResult<EventWithDivision>>

    /**
     * Update an event. Backend reuses CreateEventRequest, so all of `title`,
     * `startTime`, `endTime`, and `divisionId` must be supplied.
     */
    suspend fun updateEvent(
        id: String,
        divisionId: String,
        title: String,
        startTime: Long,
        endTime: Long,
        description: String?,
        location: String?,
    ): Result<EventWithDivision>

    /** Delete event */
    suspend fun deleteEvent(id: String): Result<Unit>
}
