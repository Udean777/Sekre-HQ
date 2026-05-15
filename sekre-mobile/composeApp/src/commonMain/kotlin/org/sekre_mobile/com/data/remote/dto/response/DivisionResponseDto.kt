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
    @SerialName("created_at") val createdAt: String,
    @SerialName("updated_at") val updatedAt: String
)
