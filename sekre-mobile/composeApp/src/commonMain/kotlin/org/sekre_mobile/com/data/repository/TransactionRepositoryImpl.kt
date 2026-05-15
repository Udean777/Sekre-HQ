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

    override suspend fun createTransaction(
        divisionId: String,
        eventId: String?,
        type: TransactionType,
        amount: Double,
        description: String,
        receiptUrl: String?
    ): Result<TransactionWithDetails> {
        return try {
            val response = httpClient.post(ApiEndpoints.Transactions.BASE) {
                contentType(ContentType.Application.Json)
                setBody(
                    CreateTransactionRequest(
                        divisionId = divisionId,
                        eventId = eventId,
                        type = type.toApiString(),
                        amount = amount,
                        description = description,
                        receiptUrl = receiptUrl
                    )
                )
            }.body<ApiResponse<TransactionWithDetailsDto>>()

            if (response.success && response.data != null) {
                Result.Success(response.data.toDomain())
            } else {
                Result.Error(Exception(response.error ?: "Failed to create transaction"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    override suspend fun getTransactionById(id: String): Result<TransactionWithDetails> {
        return try {
            val response = httpClient.get(ApiEndpoints.Transactions.byId(id))
                .body<ApiResponse<TransactionWithDetailsDto>>()

            if (response.success && response.data != null) {
                Result.Success(response.data.toDomain())
            } else {
                Result.Error(Exception(response.error ?: "Failed to get transaction"))
            }
        } catch (e: Exception) {
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
        return try {
            val response = httpClient.get(ApiEndpoints.Transactions.BASE) {
                divisionId?.let { parameter("division_id", it) }
                type?.let { parameter("type", it.toApiString()) }
                status?.let { parameter("status", it.toApiString()) }
                startDate?.let { parameter("start_date", it.toString()) }
                endDate?.let { parameter("end_date", it.toString()) }
            }.body<ApiResponse<List<TransactionWithDetailsDto>>>()

            if (response.success && response.data != null) {
                Result.Success(response.data.map { it.toDomain() })
            } else {
                Result.Error(Exception(response.error ?: "Failed to list transactions"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    override suspend fun updateTransaction(
        id: String,
        type: TransactionType?,
        amount: Double?,
        description: String?,
        receiptUrl: String?
    ): Result<TransactionWithDetails> {
        return try {
            val response = httpClient.put(ApiEndpoints.Transactions.byId(id)) {
                contentType(ContentType.Application.Json)
                setBody(
                    UpdateTransactionRequest(
                        type = type?.toApiString(),
                        amount = amount,
                        description = description,
                        receiptUrl = receiptUrl
                    )
                )
            }.body<ApiResponse<TransactionWithDetailsDto>>()

            if (response.success && response.data != null) {
                Result.Success(response.data.toDomain())
            } else {
                Result.Error(Exception(response.error ?: "Failed to update transaction"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    override suspend fun approveTransaction(id: String, status: TransactionStatus): Result<Unit> {
        return try {
            val response = httpClient.post(ApiEndpoints.Transactions.approve(id)) {
                contentType(ContentType.Application.Json)
                setBody(ApproveTransactionRequest(status = status.toApiString()))
            }.body<ApiResponse<Unit>>()

            if (response.success) {
                Result.Success(Unit)
            } else {
                Result.Error(Exception(response.error ?: "Failed to approve transaction"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    override suspend fun deleteTransaction(id: String): Result<Unit> {
        return try {
            val response = httpClient.delete(ApiEndpoints.Transactions.byId(id))
                .body<ApiResponse<Unit>>()

            if (response.success) {
                Result.Success(Unit)
            } else {
                Result.Error(Exception(response.error ?: "Failed to delete transaction"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    override suspend fun getFinanceSummary(divisionId: String?): Result<FinanceSummary> {
        return try {
            val response = httpClient.get(ApiEndpoints.Transactions.SUMMARY) {
                divisionId?.let { parameter("division_id", it) }
            }.body<ApiResponse<FinanceSummaryDto>>()

            if (response.success && response.data != null) {
                Result.Success(response.data.toDomain())
            } else {
                Result.Error(Exception(response.error ?: "Failed to get finance summary"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }
}
