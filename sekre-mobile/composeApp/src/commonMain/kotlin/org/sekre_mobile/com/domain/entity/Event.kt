package org.sekre_mobile.com.domain.entity

import org.sekre_mobile.com.domain.util.currentTimeMillis

/** Event Domain Entity Pure business object - no framework dependencies */
data class Event(
        val id: String,
        val divisionId: String,
        val title: String,
        val description: String,
        val startTime: Long, // Unix timestamp in milliseconds
        val endTime: Long,
        val location: String?,
        val createdAt: Long
) {
    /** Check if event is upcoming */
    fun isUpcoming(): Boolean = startTime > currentTimeMillis()

    /** Check if event is ongoing */
    fun isOngoing(): Boolean {
        val now = currentTimeMillis()
        return startTime <= now && endTime >= now
    }

    /** Check if event is past */
    fun isPast(): Boolean = endTime < currentTimeMillis()

    /** Check if event is today */
    fun isToday(): Boolean {
        val now = currentTimeMillis()
        val todayStart = now - (now % (24 * 60 * 60 * 1000))
        val todayEnd = todayStart + (24 * 60 * 60 * 1000)
        return startTime >= todayStart && startTime < todayEnd
    }

    /** Get event duration in hours */
    fun getDurationInHours(): Double {
        val diff = endTime - startTime
        return diff / (1000.0 * 60 * 60)
    }

    /** Check if event can be edited */
    fun canBeEdited(): Boolean = isUpcoming()

    /** Check if event can be deleted */
    fun canBeDeleted(): Boolean = isUpcoming()
}

data class EventDivision(val id: String, val name: String)

data class EventWithDivision(val event: Event, val division: EventDivision?)
