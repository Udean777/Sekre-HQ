package org.sekre_mobile.com.domain.repository

import org.sekre_mobile.com.domain.entity.EventWithDivision
import org.sekre_mobile.com.domain.model.Result

/** Event Repository Interface Domain layer - defines contract for data access */
interface EventRepository {
    /** Create a new event */
    suspend fun createEvent(
        divisionId: String,
        title: String,
        description: String?,
        startTime: Long,
        endTime: Long,
        location: String?
    ): Result<EventWithDivision>

    /** Get event by ID */
    suspend fun getEventById(id: String): Result<EventWithDivision>

    /** List events with optional filters */
    suspend fun listEvents(
        divisionId: String? = null,
        startDate: Long? = null,
        endDate: Long? = null
    ): Result<List<EventWithDivision>>

    /** Update event */
    suspend fun updateEvent(
        id: String,
        title: String?,
        description: String?,
        startTime: Long?,
        endTime: Long?,
        location: String?
    ): Result<EventWithDivision>

    /** Delete event */
    suspend fun deleteEvent(id: String): Result<Unit>
}
