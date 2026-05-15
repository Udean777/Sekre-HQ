package org.sekre_mobile.com.data.remote.dto.response

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Auth Response DTOs
 */
@Serializable
data class UserDto(
    @SerialName("id") val id: String,
    @SerialName("email") val email: String,
    @SerialName("full_name") val fullName: String,
    @SerialName("created_at") val createdAt: String
)

@Serializable
data class OrganizationDto(
    @SerialName("id") val id: String,
    @SerialName("name") val name: String,
    @SerialName("subdomain") val subdomain: String,
    @SerialName("subscription_plan") val subscriptionPlan: String,
    @SerialName("created_at") val createdAt: String
)

@Serializable
data class TokensDto(
    @SerialName("access_token") val accessToken: String,
    @SerialName("refresh_token") val refreshToken: String
)

@Serializable
data class AuthResponseDto(
    @SerialName("user") val user: UserDto,
    @SerialName("organization") val organization: OrganizationDto,
    @SerialName("role") val role: String,
    @SerialName("tokens") val tokens: TokensDto
)
