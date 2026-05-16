package org.sekre_mobile.com.data.remote.dto.response

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Backend pagination envelope returned alongside list payloads:
 * `{ data: [...], pagination: {...} }`.
 *
 * Shared by every paginated list endpoint (events, transactions, members, ...).
 */
@Serializable
data class PaginationMetaDto(
    @SerialName("page") val page: Int? = null,
    @SerialName("page_size") val pageSize: Int? = null,
    @SerialName("limit") val limit: Int? = null,
    @SerialName("offset") val offset: Int? = null,
    @SerialName("total") val total: Int? = null,
    @SerialName("total_pages") val totalPages: Int? = null,
)
