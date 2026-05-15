package org.sekre_mobile.com.data.mapper

import org.sekre_mobile.com.data.mapper.MapperUtils.parseTimestamp
import org.sekre_mobile.com.data.mapper.MapperUtils.toIso8601String
import org.sekre_mobile.com.data.remote.dto.response.EventDivisionDto
import org.sekre_mobile.com.data.remote.dto.response.EventDto
import org.sekre_mobile.com.data.remote.dto.response.EventWithDivisionDto
import org.sekre_mobile.com.domain.entity.Event
import org.sekre_mobile.com.domain.entity.EventDivision
import org.sekre_mobile.com.domain.entity.EventWithDivision

/**
 * Event Mapper
 * Data layer - converts between DTOs and domain entities
 */
object EventMapper {
    private fun EventWithDivisionDto.resolveEventDto(): EventDto {
        val nested = event
        if (nested != null) return nested
        return EventDto(
            id = id.orEmpty(),
            divisionId = divisionId.orEmpty(),
            title = title.orEmpty(),
            description = description.orEmpty(),
            startTime = startTime.orEmpty(),
            endTime = endTime.orEmpty(),
            location = location,
            createdAt = createdAt.orEmpty(),
        )
    }
    
    /** Convert EventDto to Event entity */
    fun EventDto.toDomain(): Event {
        return Event(
            id = id,
            divisionId = divisionId,
            title = title,
            description = description,
            startTime = parseTimestamp(startTime),
            endTime = parseTimestamp(endTime),
            location = location,
            createdAt = parseTimestamp(createdAt)
        )
    }
    
    /** Convert EventDivisionDto to EventDivision entity */
    fun EventDivisionDto.toDomain(): EventDivision {
        return EventDivision(
            id = id,
            name = name
        )
    }
    
    /** Convert EventWithDivisionDto to EventWithDivision entity */
    fun EventWithDivisionDto.toDomain(): EventWithDivision {
        val resolved = resolveEventDto()
        return EventWithDivision(
            event = resolved.toDomain(),
            division = division?.toDomain()
        )
    }
}
