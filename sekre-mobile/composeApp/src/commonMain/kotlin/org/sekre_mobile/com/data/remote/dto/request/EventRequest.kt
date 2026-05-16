package org.sekre_mobile.com.data.remote.dto.request

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Event Request DTOs
 *
 * Aligned with sekre-backend contract:
 * - POST /events: requires division_id, title, start_time, end_time. description/location optional.
 * - PUT  /events/{id}: backend reuses CreateEventRequest, so the same shape is sent for updates.
 *   division_id MAY be changed on update.
 */
@Serializable
data class CreateEventRequest(
    @SerialName("division_id") val divisionId: String,
    @SerialName("title") val title: String,
    @SerialName("start_time") val startTime: String, // RFC3339
    @SerialName("end_time") val endTime: String,     // RFC3339
    @SerialName("description") val description: String? = null,
    @SerialName("location") val location: String? = null,
)
