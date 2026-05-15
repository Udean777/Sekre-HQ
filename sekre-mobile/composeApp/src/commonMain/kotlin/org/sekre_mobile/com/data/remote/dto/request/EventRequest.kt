package org.sekre_mobile.com.data.remote.dto.request

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Event Request DTOs
 */
@Serializable
data class CreateEventRequest(
    @SerialName("division_id") val divisionId: String,
    @SerialName("title") val title: String,
    @SerialName("description") val description: String?,
    @SerialName("start_time") val startTime: String,
    @SerialName("end_time") val endTime: String,
    @SerialName("location") val location: String?
)

@Serializable
data class UpdateEventRequest(
    @SerialName("title") val title: String?,
    @SerialName("description") val description: String?,
    @SerialName("start_time") val startTime: String?,
    @SerialName("end_time") val endTime: String?,
    @SerialName("location") val location: String?
)
