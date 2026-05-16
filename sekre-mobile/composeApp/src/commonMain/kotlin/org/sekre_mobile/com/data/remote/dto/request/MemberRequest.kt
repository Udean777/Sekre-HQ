package org.sekre_mobile.com.data.remote.dto.request

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class CreateMemberRequest(
    @SerialName("email") val email: String,
    @SerialName("full_name") val fullName: String,
    @SerialName("role") val role: String = "MEMBER",
    @SerialName("division_ids") val divisionIds: List<String> = emptyList(),
)
