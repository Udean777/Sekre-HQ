package org.sekre_mobile.com.data.mapper

import org.sekre_mobile.com.data.mapper.MapperUtils.parseTimestamp
import org.sekre_mobile.com.data.remote.dto.response.DivisionDto
import org.sekre_mobile.com.data.remote.dto.response.DivisionMemberDto
import org.sekre_mobile.com.domain.entity.Division
import org.sekre_mobile.com.domain.entity.DivisionMemberUser
import org.sekre_mobile.com.domain.entity.DivisionRole

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
            updatedAt = updatedAt?.let { parseTimestamp(it) } ?: parseTimestamp(createdAt)
        )
    }

    /** Convert DivisionMemberDto to DivisionMemberUser entity. */
    fun DivisionMemberDto.toDomain(): DivisionMemberUser {
        return DivisionMemberUser(
            id = user.id,
            email = user.email,
            fullName = user.fullName,
            divisionRole = parseDivisionRole(divisionRole),
        )
    }

    private fun parseDivisionRole(role: String): DivisionRole = when (role.uppercase()) {
        "HEAD" -> DivisionRole.HEAD
        else -> DivisionRole.STAFF
    }
}
