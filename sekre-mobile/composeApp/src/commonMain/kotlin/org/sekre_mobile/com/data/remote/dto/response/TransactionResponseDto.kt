package org.sekre_mobile.com.data.remote.dto.response

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Transaction Response DTOs
 */
@Serializable
data class MoneyDto(
    @SerialName("amount_cents") val amountCents: Long,
    @SerialName("currency") val currency: String,
    @SerialName("formatted") val formatted: String? = null,
)

@Serializable
data class TransactionDto(
    @SerialName("id") val id: String,
    @SerialName("division_id") val divisionId: String,
    @SerialName("event_id") val eventId: String?,
    @SerialName("type") val type: String,
    @SerialName("amount") val amount: MoneyDto,
    @SerialName("description") val description: String,
    @SerialName("status") val status: String,
    @SerialName("requested_by") val requestedBy: String,
    @SerialName("approved_by") val approvedBy: String?,
    @SerialName("receipt_url") val receiptUrl: String?,
    @SerialName("created_at") val createdAt: String,
    @SerialName("updated_at") val updatedAt: String?
)

@Serializable
data class RequesterDto(
    @SerialName("id") val id: String,
    @SerialName("email") val email: String,
    @SerialName("full_name") val fullName: String
)

@Serializable
data class ApproverDto(
    @SerialName("id") val id: String,
    @SerialName("email") val email: String,
    @SerialName("full_name") val fullName: String
)

@Serializable
data class TransactionWithDetailsDto(
    @SerialName("transaction") val transaction: TransactionDto,
    @SerialName("requester") val requester: RequesterDto?,
    @SerialName("approver") val approver: ApproverDto?
)

/**
 * Backend list endpoint returns paginated payload of flat transactions:
 * { data: [Transaction, ...], pagination: {...} }
 */
@Serializable
data class TransactionListPayloadDto(
    @SerialName("data") val data: List<TransactionDto> = emptyList(),
    @SerialName("pagination") val pagination: PaginationMetaDto? = null,
)

@Serializable
data class FinanceSummaryDto(
    @SerialName("total_income") val totalIncome: MoneyDto,
    @SerialName("total_expense") val totalExpense: MoneyDto,
    @SerialName("balance") val balance: MoneyDto,
    @SerialName("transaction_count") val transactionCount: Int? = null,
)
