package org.sekre_mobile.com.data.remote.dto.response

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Transaction Response DTOs
 */
@Serializable
data class TransactionDto(
    @SerialName("id") val id: String,
    @SerialName("division_id") val divisionId: String,
    @SerialName("event_id") val eventId: String?,
    @SerialName("type") val type: String,
    @SerialName("amount") val amount: Double,
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

@Serializable
data class FinanceSummaryDto(
    @SerialName("total_income") val totalIncome: Double,
    @SerialName("total_expense") val totalExpense: Double,
    @SerialName("balance") val balance: Double,
    @SerialName("transaction_count") val transactionCount: Int
)
