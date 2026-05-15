package org.sekre_mobile.com.data.mapper

import org.sekre_mobile.com.data.mapper.MapperUtils.parseTimestamp
import org.sekre_mobile.com.data.remote.dto.response.DivisionDto
import org.sekre_mobile.com.domain.entity.Division

/**
 * Division Mapper
 * Data layer - converts between DTOs and domain entities
 */
object DivisionMapper {

    /** Convert DivisionDto to Division entity */
    fun DivisionDto.toDomain(): Division {
        return Division(
            id = id,
            organizationId = organizationId,
            name = name,
            createdAt = parseTimestamp(createdAt),
            updatedAt = parseTimestamp(updatedAt)
        )
    }
}
