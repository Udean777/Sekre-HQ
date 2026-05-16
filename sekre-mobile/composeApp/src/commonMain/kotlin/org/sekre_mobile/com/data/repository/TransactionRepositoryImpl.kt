package org.sekre_mobile.com.data.repository

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*
import org.sekre_mobile.com.data.mapper.TransactionMapper.toApiString
import org.sekre_mobile.com.data.mapper.TransactionMapper.toDomain
import org.sekre_mobile.com.data.remote.api.ApiEndpoints
import org.sekre_mobile.com.data.remote.dto.request.CreateTransactionRequest
import org.sekre_mobile.com.data.remote.dto.request.UpdateTransactionRequest
import org.sekre_mobile.com.data.remote.dto.response.ApiResponse
import org.sekre_mobile.com.data.remote.dto.response.FinanceSummaryDto
import org.sekre_mobile.com.data.remote.dto.response.TransactionDto
import org.sekre_mobile.com.data.remote.dto.response.TransactionListPayloadDto
import org.sekre_mobile.com.data.remote.dto.response.TransactionWithDetailsDto
import org.sekre_mobile.com.domain.entity.FinanceSummary
import org.sekre_mobile.com.domain.entity.TransactionType
import org.sekre_mobile.com.domain.entity.TransactionWithDetails
import org.sekre_mobile.com.domain.model.PaginatedResult
import org.sekre_mobile.com.domain.model.PaginationParams
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.TransactionRepository

/**
 * Transaction Repository Implementation
 * Data layer - implements transaction data access using Ktor
 */
class TransactionRepositoryImpl(
    private val httpClient: HttpClient
) : TransactionRepository {
    private fun log(tag: String, msg: String) {
        println("[DEBUG][TransactionRepository][$tag] $msg")
    }

    private fun logErr(tag: String, e: Exception) {
        println("[DEBUG][TransactionRepository][$tag][ERROR] type=${e::class.simpleName} message=${e.message}")
        e.cause?.let {
            println("[DEBUG][TransactionRepository][$tag][ERROR] causeType=${it::class.simpleName} causeMessage=${it.message}")
        }
        println("[DEBUG][TransactionRepository][$tag][STACKTRACE]\n${e.stackTraceToString()}")
    }

    override suspend fun createTransaction(
        divisionId: String,
        type: TransactionType,
        amountCents: Long,
        description: String,
        currency: String,
        eventId: String?,
        receiptUrl: String?,
    ): Result<TransactionWithDetails> {
        log(
            "create",
            "start divisionId=$divisionId type=$type amountCents=$amountCents currency=$currency"
        )
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
                        receiptUrl = receiptUrl,
                    )
                )
            }.body<ApiResponse<TransactionDto>>()

            if (response.success && response.data != null) {
                log("create", "success id=${response.data.id}")
                Result.Success(
                    TransactionWithDetailsDto(
                        transaction = response.data,
                        requester = null,
                        approver = null,
                    ).toDomain()
                )
            } else {
                log(
                    "create",
                    "fail error=${response.error} message=${response.message} code=${response.code}"
                )
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
                .body<ApiResponse<TransactionDto>>()

            if (response.success && response.data != null) {
                log("getById", "success id=${response.data.id}")
                Result.Success(
                    TransactionWithDetailsDto(
                        transaction = response.data,
                        requester = null,
                        approver = null,
                    ).toDomain()
                )
            } else {
                log(
                    "getById",
                    "fail error=${response.error} message=${response.message} code=${response.code}"
                )
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
        startDate: String?,
        endDate: String?,
        pagination: PaginationParams,
    ): Result<PaginatedResult<TransactionWithDetails>> {
        log(
            "list",
            "start divisionId=$divisionId type=$type startDate=$startDate endDate=$endDate limit=${pagination.limit} offset=${pagination.offset}"
        )
        return try {
            val response = httpClient.get(ApiEndpoints.Transactions.BASE) {
                divisionId?.let { parameter("division_id", it) }
                type?.let { parameter("type", it.toApiString()) }
                startDate?.let { parameter("start_date", it) }
                endDate?.let { parameter("end_date", it) }
                parameter("limit", pagination.limit)
                parameter("offset", pagination.offset)
            }.body<ApiResponse<TransactionListPayloadDto>>()

            if (response.success && response.data != null) {
                val items = response.data.data.map { dto ->
                    TransactionWithDetailsDto(
                        transaction = dto,
                        requester = null,
                        approver = null,
                    ).toDomain()
                }
                val meta = response.data.pagination
                val limit = meta?.limit ?: meta?.pageSize ?: pagination.limit
                val offset = meta?.offset ?: pagination.offset
                val total = meta?.total ?: items.size
                log("list", "success count=${items.size} total=$total")
                Result.Success(
                    PaginatedResult(
                        items = items,
                        total = total,
                        limit = limit,
                        offset = offset,
                    )
                )
            } else {
                log(
                    "list",
                    "fail error=${response.error} message=${response.message} code=${response.code}"
                )
                Result.Error(Exception(response.error ?: "Failed to list transactions"))
            }
        } catch (e: Exception) {
            logErr("list", e)
            Result.Error(e)
        }
    }

    override suspend fun updateTransaction(
        id: String,
        type: TransactionType,
        amountCents: Long,
        description: String,
        currency: String,
        receiptUrl: String?,
    ): Result<TransactionWithDetails> {
        log("update", "start id=$id type=$type amountCents=$amountCents currency=$currency")
        return try {
            val response = httpClient.put(ApiEndpoints.Transactions.byId(id)) {
                contentType(ContentType.Application.Json)
                setBody(
                    UpdateTransactionRequest(
                        type = type.toApiString(),
                        amountCents = amountCents,
                        currency = currency,
                        description = description,
                        receiptUrl = receiptUrl,
                    )
                )
            }.body<ApiResponse<TransactionDto>>()

            if (response.success && response.data != null) {
                log("update", "success id=${response.data.id}")
                Result.Success(
                    TransactionWithDetailsDto(
                        transaction = response.data,
                        requester = null,
                        approver = null,
                    ).toDomain()
                )
            } else {
                log(
                    "update",
                    "fail error=${response.error} message=${response.message} code=${response.code}"
                )
                Result.Error(Exception(response.error ?: "Failed to update transaction"))
            }
        } catch (e: Exception) {
            logErr("update", e)
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
                log(
                    "delete",
                    "fail error=${response.error} message=${response.message} code=${response.code}"
                )
                Result.Error(Exception(response.error ?: "Failed to delete transaction"))
            }
        } catch (e: Exception) {
            logErr("delete", e)
            Result.Error(e)
        }
    }

    override suspend fun getFinanceSummary(
        divisionId: String?,
        startDate: String?,
        endDate: String?,
    ): Result<FinanceSummary> {
        log("summary", "start divisionId=$divisionId startDate=$startDate endDate=$endDate")
        return try {
            val response = httpClient.get(ApiEndpoints.Transactions.SUMMARY) {
                divisionId?.let { parameter("division_id", it) }
                startDate?.let { parameter("start_date", it) }
                endDate?.let { parameter("end_date", it) }
            }.body<ApiResponse<FinanceSummaryDto>>()

            if (response.success && response.data != null) {
                log("summary", "success txCount=${response.data.transactionCount}")
                Result.Success(response.data.toDomain())
            } else {
                log(
                    "summary",
                    "fail error=${response.error} message=${response.message} code=${response.code}"
                )
                Result.Error(Exception(response.error ?: "Failed to get finance summary"))
            }
        } catch (e: Exception) {
            logErr("summary", e)
            Result.Error(e)
        }
    }
}
