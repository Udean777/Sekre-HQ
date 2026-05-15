package org.sekre_mobile.com.data.remote.dto.request

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Transaction Request DTOs
 */
@Serializable
data class CreateTransactionRequest(
    @SerialName("division_id") val divisionId: String,
    @SerialName("event_id") val eventId: String?,
    @SerialName("type") val type: String,
    @SerialName("amount") val amount: Double,
    @SerialName("description") val description: String,
    @SerialName("receipt_url") val receiptUrl: String?
)

@Serializable
data class UpdateTransactionRequest(
    @SerialName("type") val type: String?,
    @SerialName("amount") val amount: Double?,
    @SerialName("description") val description: String?,
    @SerialName("receipt_url") val receiptUrl: String?
)

@Serializable
data class ApproveTransactionRequest(
    @SerialName("status") val status: String
)
