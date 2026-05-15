package org.sekre_mobile.com.data.repository

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*
import org.sekre_mobile.com.data.mapper.TransactionMapper
import org.sekre_mobile.com.data.mapper.TransactionMapper.toApiString
import org.sekre_mobile.com.data.mapper.TransactionMapper.toDomain
import org.sekre_mobile.com.data.remote.api.ApiEndpoints
import org.sekre_mobile.com.data.remote.dto.request.ApproveTransactionRequest
import org.sekre_mobile.com.data.remote.dto.request.CreateTransactionRequest
import org.sekre_mobile.com.data.remote.dto.request.UpdateTransactionRequest
import org.sekre_mobile.com.data.remote.dto.response.ApiResponse
import org.sekre_mobile.com.data.remote.dto.response.FinanceSummaryDto
import org.sekre_mobile.com.data.remote.dto.response.TransactionWithDetailsDto
import org.sekre_mobile.com.domain.entity.FinanceSummary
import org.sekre_mobile.com.domain.entity.TransactionStatus
import org.sekre_mobile.com.domain.entity.TransactionType
import org.sekre_mobile.com.domain.entity.TransactionWithDetails
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.TransactionRepository

/**
 * Transaction Repository Implementation
 * Data layer - implements transaction data access using Ktor
 */
class TransactionRepositoryImpl(
    private val httpClient: HttpClient
) : TransactionRepository {
    private fun log(tag: String, msg: String) { /* debug disabled */ }
    private fun logErr(tag: String, e: Exception) {
        log(tag, "type=${e::class.simpleName} message=${e.message}")
        e.cause?.let { log(tag, "causeType=${it::class.simpleName} causeMessage=${it.message}") }
        log(tag, "stacktrace=${e.stackTraceToString()}")
    }

    override suspend fun createTransaction(
        divisionId: String,
        eventId: String?,
        type: TransactionType,
        amountCents: Long,
        currency: String,
        description: String,
        receiptUrl: String?
    ): Result<TransactionWithDetails> {
        log("create", "start divisionId=$divisionId type=$type amountCents=$amountCents currency=$currency")
        return try {
            val response = httpClient.post(ApiEndpoints.Transactions.BASE) {
                contentType(ContentType.Application.Json)
                setBody(
                    CreateTransactionRequest(
                        divisionId = divisionId,
                        eventId = eventId,
                        type = type.toApiString(),
                        amountCents = amountCents,
                        currency = currency,
                        description = description,
                        receiptUrl = receiptUrl
                    )
                )
            }.body<ApiResponse<TransactionWithDetailsDto>>()

            if (response.success && response.data != null) {
                log("create", "success id=${response.data.transaction.id}")
                Result.Success(response.data.toDomain())
            } else {
                log("create", "fail error=${response.error} message=${response.message} code=${response.code}")
                Result.Error(Exception(response.error ?: "Failed to create transaction"))
            }
        } catch (e: Exception) {
            logErr("create", e)
            Result.Error(e)
        }
    }

    override suspend fun getTransactionById(id: String): Result<TransactionWithDetails> {
        log("getById", "start id=$id")
        return try {
            val response = httpClient.get(ApiEndpoints.Transactions.byId(id))
                .body<ApiResponse<TransactionWithDetailsDto>>()

            if (response.success && response.data != null) {
                log("getById", "success id=${response.data.transaction.id}")
                Result.Success(response.data.toDomain())
            } else {
                log("getById", "fail error=${response.error} message=${response.message} code=${response.code}")
                Result.Error(Exception(response.error ?: "Failed to get transaction"))
            }
        } catch (e: Exception) {
            logErr("getById", e)
            Result.Error(e)
        }
    }

    override suspend fun listTransactions(
        divisionId: String?,
        type: TransactionType?,
        status: TransactionStatus?,
        startDate: Long?,
        endDate: Long?
    ): Result<List<TransactionWithDetails>> {
        log("list", "start divisionId=$divisionId type=$type status=$status")
        return try {
            val response = httpClient.get(ApiEndpoints.Transactions.BASE) {
                divisionId?.let { parameter("division_id", it) }
                type?.let { parameter("type", it.toApiString()) }
                status?.let { parameter("status", it.toApiString()) }
                startDate?.let { parameter("start_date", it.toString()) }
                endDate?.let { parameter("end_date", it.toString()) }
            }.body<ApiResponse<List<TransactionWithDetailsDto>>>()

            if (response.success && response.data != null) {
                log("list", "success count=${response.data.size}")
                Result.Success(response.data.map { it.toDomain() })
            } else {
                log("list", "fail error=${response.error} message=${response.message} code=${response.code}")
                Result.Error(Exception(response.error ?: "Failed to list transactions"))
            }
        } catch (e: Exception) {
            logErr("list", e)
            Result.Error(e)
        }
    }

    override suspend fun updateTransaction(
        id: String,
        type: TransactionType?,
        amountCents: Long?,
        currency: String?,
        description: String?,
        receiptUrl: String?
    ): Result<TransactionWithDetails> {
        log("update", "start id=$id type=$type amountCents=$amountCents currency=$currency")
        return try {
            val response = httpClient.put(ApiEndpoints.Transactions.byId(id)) {
                contentType(ContentType.Application.Json)
                setBody(
                    UpdateTransactionRequest(
                        type = type?.toApiString(),
                        amountCents = amountCents,
                        currency = currency,
                        description = description,
                        receiptUrl = receiptUrl
                    )
                )
            }.body<ApiResponse<TransactionWithDetailsDto>>()

            if (response.success && response.data != null) {
                log("update", "success id=${response.data.transaction.id}")
                Result.Success(response.data.toDomain())
            } else {
                log("update", "fail error=${response.error} message=${response.message} code=${response.code}")
                Result.Error(Exception(response.error ?: "Failed to update transaction"))
            }
        } catch (e: Exception) {
            logErr("update", e)
            Result.Error(e)
        }
    }

    override suspend fun approveTransaction(id: String, status: TransactionStatus): Result<Unit> {
        log("approve", "start id=$id status=$status")
        return try {
            val response = httpClient.post(ApiEndpoints.Transactions.approve(id)) {
                contentType(ContentType.Application.Json)
                setBody(ApproveTransactionRequest(status = status.toApiString()))
            }.body<ApiResponse<Unit>>()

            if (response.success) {
                log("approve", "success id=$id")
                Result.Success(Unit)
            } else {
                log("approve", "fail error=${response.error} message=${response.message} code=${response.code}")
                Result.Error(Exception(response.error ?: "Failed to approve transaction"))
            }
        } catch (e: Exception) {
            logErr("approve", e)
            Result.Error(e)
        }
    }

    override suspend fun deleteTransaction(id: String): Result<Unit> {
        log("delete", "start id=$id")
        return try {
            val response = httpClient.delete(ApiEndpoints.Transactions.byId(id))
                .body<ApiResponse<Unit>>()

            if (response.success) {
                log("delete", "success id=$id")
                Result.Success(Unit)
            } else {
                log("delete", "fail error=${response.error} message=${response.message} code=${response.code}")
                Result.Error(Exception(response.error ?: "Failed to delete transaction"))
            }
        } catch (e: Exception) {
            logErr("delete", e)
            Result.Error(e)
        }
    }

    override suspend fun getFinanceSummary(divisionId: String?): Result<FinanceSummary> {
        log("summary", "start divisionId=$divisionId")
        return try {
            val response = httpClient.get(ApiEndpoints.Transactions.SUMMARY) {
                divisionId?.let { parameter("division_id", it) }
            }.body<ApiResponse<FinanceSummaryDto>>()

            if (response.success && response.data != null) {
                log("summary", "success txCount=${response.data.transactionCount}")
                Result.Success(response.data.toDomain())
            } else {
                log("summary", "fail error=${response.error} message=${response.message} code=${response.code}")
                Result.Error(Exception(response.error ?: "Failed to get finance summary"))
            }
        } catch (e: Exception) {
            logErr("summary", e)
            Result.Error(e)
        }
    }
}
