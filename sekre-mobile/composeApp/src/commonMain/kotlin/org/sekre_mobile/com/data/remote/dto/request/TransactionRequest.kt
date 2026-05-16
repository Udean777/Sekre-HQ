package org.sekre_mobile.com.data.remote.dto.request

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Transaction Request DTOs
 *
 * Aligned with sekre-backend contract:
 * - POST /transactions: requires division_id, type, amount_cents (>0), description.
 *   currency defaults to IDR on the server when omitted; event_id and receipt_url
 *   are optional.
 * - PUT  /transactions/{id}: backend reuses CreateTransactionRequest, so the same
 *   shape (minus division_id, which the server keeps from the existing record) is
 *   sent for updates. The backend rejects updates while the transaction is in a
 *   terminal status (APPROVED/REJECTED), so this DTO is only useful when the
 *   record is still PENDING.
 *
 * The approve endpoint does not exist on the backend and is intentionally not
 * modelled here.
 */
@Serializable
data class CreateTransactionRequest(
    @SerialName("division_id") val divisionId: String,
    @SerialName("type") val type: String,
    @SerialName("amount_cents") val amountCents: Long,
    @SerialName("description") val description: String,
    @SerialName("currency") val currency: String? = null,
    @SerialName("event_id") val eventId: String? = null,
    @SerialName("receipt_url") val receiptUrl: String? = null,
)

@Serializable
data class UpdateTransactionRequest(
    @SerialName("type") val type: String,
    @SerialName("amount_cents") val amountCents: Long,
    @SerialName("description") val description: String,
    @SerialName("currency") val currency: String? = null,
    @SerialName("receipt_url") val receiptUrl: String? = null,
)
