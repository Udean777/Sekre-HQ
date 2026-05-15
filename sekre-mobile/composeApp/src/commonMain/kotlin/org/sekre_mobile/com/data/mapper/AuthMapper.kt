package org.sekre_mobile.com.data.mapper

import org.sekre_mobile.com.data.mapper.MapperUtils.parseTimestamp
import org.sekre_mobile.com.data.remote.dto.response.AuthResponseDto
import org.sekre_mobile.com.data.remote.dto.response.OrganizationDto
import org.sekre_mobile.com.data.remote.dto.response.UserDto
import org.sekre_mobile.com.domain.entity.AuthenticatedUser
import org.sekre_mobile.com.domain.entity.Organization
import org.sekre_mobile.com.domain.entity.SubscriptionPlan
import org.sekre_mobile.com.domain.entity.User
import org.sekre_mobile.com.domain.entity.UserRole

/**
 * Auth Mapper
 * Data layer - converts between DTOs and domain entities
 */
object AuthMapper {

    /** Convert UserDto to User entity */
    fun UserDto.toDomain(): User {
        return User(
            id = id,
            email = email,
            fullName = fullName,
            createdAt = parseTimestamp(createdAt)
        )
    }

    /** Convert OrganizationDto to Organization entity */
    fun OrganizationDto.toDomain(): Organization {
        return Organization(
            id = id,
            name = name,
            subdomain = subdomain,
            subscriptionPlan = parseSubscriptionPlan(subscriptionPlan),
            createdAt = parseTimestamp(createdAt)
        )
    }

    /** Convert AuthResponseDto to AuthenticatedUser entity */
    fun AuthResponseDto.toDomain(): AuthenticatedUser {
        return AuthenticatedUser(
            user = user.toDomain(),
            organization = organization.toDomain(),
            role = parseUserRole(role)
        )
    }

    /** Parse subscription plan from string */
    private fun parseSubscriptionPlan(plan: String): SubscriptionPlan {
        return when (plan.uppercase()) {
            "FREE" -> SubscriptionPlan.FREE
            "LITE" -> SubscriptionPlan.LITE
            "PRO" -> SubscriptionPlan.PRO
            else -> SubscriptionPlan.FREE
        }
    }

    /** Parse user role from string */
    private fun parseUserRole(role: String): UserRole {
        return when (role.uppercase()) {
            "OWNER" -> UserRole.OWNER
            "ADMIN" -> UserRole.ADMIN
            "MEMBER" -> UserRole.MEMBER
            else -> UserRole.MEMBER
        }
    }
}

