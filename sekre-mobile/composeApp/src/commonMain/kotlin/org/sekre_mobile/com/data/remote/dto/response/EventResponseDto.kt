package org.sekre_mobile.com.data.remote.dto.response

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Event Response DTOs
 */
@Serializable
data class EventDto(
    @SerialName("id") val id: String,
    @SerialName("division_id") val divisionId: String,
    @SerialName("title") val title: String,
    @SerialName("description") val description: String,
    @SerialName("start_time") val startTime: String,
    @SerialName("end_time") val endTime: String,
    @SerialName("location") val location: String?,
    @SerialName("created_at") val createdAt: String
)

@Serializable
data class EventDivisionDto(
    @SerialName("id") val id: String,
    @SerialName("name") val name: String
)

@Serializable
data class EventWithDivisionDto(
    @SerialName("event") val event: EventDto? = null,
    @SerialName("division") val division: EventDivisionDto? = null,
    @SerialName("id") val id: String? = null,
    @SerialName("division_id") val divisionId: String? = null,
    @SerialName("title") val title: String? = null,
    @SerialName("description") val description: String? = null,
    @SerialName("start_time") val startTime: String? = null,
    @SerialName("end_time") val endTime: String? = null,
    @SerialName("location") val location: String? = null,
    @SerialName("created_at") val createdAt: String? = null,
)

@Serializable
data class EventListPayloadDto(
    @SerialName("data") val data: List<EventWithDivisionDto> = emptyList(),
    @SerialName("pagination") val pagination: PaginationMetaDto? = null,
)
