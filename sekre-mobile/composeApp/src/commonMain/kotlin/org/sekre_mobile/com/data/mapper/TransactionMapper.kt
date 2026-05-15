package org.sekre_mobile.com.data.mapper

import org.sekre_mobile.com.data.mapper.MapperUtils.parseTimestamp
import org.sekre_mobile.com.data.remote.dto.response.ApproverDto
import org.sekre_mobile.com.data.remote.dto.response.FinanceSummaryDto
import org.sekre_mobile.com.data.remote.dto.response.RequesterDto
import org.sekre_mobile.com.data.remote.dto.response.TransactionDto
import org.sekre_mobile.com.data.remote.dto.response.TransactionWithDetailsDto
import org.sekre_mobile.com.domain.entity.FinanceSummary
import org.sekre_mobile.com.domain.entity.Transaction
import org.sekre_mobile.com.domain.entity.TransactionApprover
import org.sekre_mobile.com.domain.entity.TransactionRequester
import org.sekre_mobile.com.domain.entity.TransactionStatus
import org.sekre_mobile.com.domain.entity.TransactionType
import org.sekre_mobile.com.domain.entity.TransactionWithDetails

/**
 * Transaction Mapper
 * Data layer - converts between DTOs and domain entities
 */
object TransactionMapper {
    
    /** Convert TransactionDto to Transaction entity */
    fun TransactionDto.toDomain(): Transaction {
        return Transaction(
            id = id,
            divisionId = divisionId,
            eventId = eventId,
            type = parseTransactionType(type),
            amount = amount,
            description = description,
            status = parseTransactionStatus(status),
            requestedBy = requestedBy,
            approvedBy = approvedBy,
            receiptUrl = receiptUrl,
            createdAt = parseTimestamp(createdAt),
            updatedAt = updatedAt?.let { parseTimestamp(it) }
        )
    }
    
    /** Convert RequesterDto to TransactionRequester entity */
    fun RequesterDto.toDomain(): TransactionRequester {
        return TransactionRequester(
            id = id,
            email = email,
            fullName = fullName
        )
    }
    
    /** Convert ApproverDto to TransactionApprover entity */
    fun ApproverDto.toDomain(): TransactionApprover {
        return TransactionApprover(
            id = id,
            email = email,
            fullName = fullName
        )
    }
    
    /** Convert TransactionWithDetailsDto to TransactionWithDetails entity */
    fun TransactionWithDetailsDto.toDomain(): TransactionWithDetails {
        return TransactionWithDetails(
            transaction = transaction.toDomain(),
            requester = requester?.toDomain(),
            approver = approver?.toDomain()
        )
    }
    
    /** Convert FinanceSummaryDto to FinanceSummary entity */
    fun FinanceSummaryDto.toDomain(): FinanceSummary {
        return FinanceSummary(
            totalIncome = totalIncome,
            totalExpense = totalExpense,
            balance = balance,
            transactionCount = transactionCount
        )
    }
    
    /** Parse transaction type from string */
    private fun parseTransactionType(type: String): TransactionType {
        return when (type.uppercase()) {
            "INCOME" -> TransactionType.INCOME
            "EXPENSE" -> TransactionType.EXPENSE
            else -> TransactionType.EXPENSE
        }
    }
    
    /** Convert TransactionType to string for API */
    fun TransactionType.toApiString(): String {
        return when (this) {
            TransactionType.INCOME -> "INCOME"
            TransactionType.EXPENSE -> "EXPENSE"
        }
    }
    
    /** Parse transaction status from string */
    private fun parseTransactionStatus(status: String): TransactionStatus {
        return when (status.uppercase()) {
            "PENDING" -> TransactionStatus.PENDING
            "APPROVED" -> TransactionStatus.APPROVED
            "REJECTED" -> TransactionStatus.REJECTED
            else -> TransactionStatus.PENDING
        }
    }
    
    /** Convert TransactionStatus to string for API */
    fun TransactionStatus.toApiString(): String {
        return when (this) {
            TransactionStatus.PENDING -> "PENDING"
            TransactionStatus.APPROVED -> "APPROVED"
            TransactionStatus.REJECTED -> "REJECTED"
        }
    }
}
