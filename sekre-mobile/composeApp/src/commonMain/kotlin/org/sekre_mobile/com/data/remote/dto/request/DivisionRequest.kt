package org.sekre_mobile.com.data.remote.dto.request

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Division Request DTOs
 */
@Serializable
data class CreateDivisionRequest(
    @SerialName("name") val name: String
)

@Serializable
data class UpdateDivisionRequest(
    @SerialName("name") val name: String
)
