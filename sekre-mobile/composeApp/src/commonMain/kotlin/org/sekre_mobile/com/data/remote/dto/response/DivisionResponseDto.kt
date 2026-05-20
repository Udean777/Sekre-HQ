package org.sekre_mobile.com.data.remote.dto.response

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Division Response DTOs
 */
@Serializable
data class DivisionDto(
    @SerialName("id") val id: String,
    @SerialName("organization_id") val organizationId: String,
    @SerialName("name") val name: String,
    @SerialName("description") val description: String? = null,
    @SerialName("head_id") val headId: String? = null,
    @SerialName("member_count") val memberCount: Int? = null,
    @SerialName("created_at") val createdAt: String,
    @SerialName("updated_at") val updatedAt: String? = null,
)

/**
 * Backend wraps lists in a paginated payload: { data: [...], pagination: {...} }
 */
@Serializable
data class DivisionListPayloadDto(
    @SerialName("data") val data: List<DivisionDto> = emptyList(),
)

/** Member of a division as returned by GET /divisions/{id}/members */
@Serializable
data class DivisionMemberUserDto(
    @SerialName("id") val id: String,
    @SerialName("email") val email: String,
    @SerialName("full_name") val fullName: String,
)

@Serializable
data class DivisionMemberDto(
    @SerialName("user") val user: DivisionMemberUserDto,
    @SerialName("division_role") val divisionRole: String,
    @SerialName("joined_at") val joinedAt: String? = null,
)

@Serializable
data class DivisionMemberListPayloadDto(
    @SerialName("data") val data: List<DivisionMemberDto> = emptyList(),
)

/**
 * Backend `GET /divisions/{id}` returns `DivisionWithMembers`:
 * `{ division: {...}, members: [{ user: {...}, division_role, joined_at }, ...] }`
 */
@Serializable
data class DivisionDetailPayloadDto(
    @SerialName("division") val division: DivisionDto,
    @SerialName("members") val members: List<DivisionMemberDto> = emptyList(),
)
