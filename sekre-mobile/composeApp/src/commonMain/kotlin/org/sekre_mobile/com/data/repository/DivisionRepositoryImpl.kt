package org.sekre_mobile.com.data.repository

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*
import org.sekre_mobile.com.data.mapper.DivisionMapper.toDomain
import org.sekre_mobile.com.data.remote.api.ApiEndpoints
import org.sekre_mobile.com.data.remote.dto.request.CreateDivisionRequest
import org.sekre_mobile.com.data.remote.dto.request.UpdateDivisionRequest
import org.sekre_mobile.com.data.remote.dto.response.ApiResponse
import org.sekre_mobile.com.data.remote.dto.response.DivisionDto
import org.sekre_mobile.com.domain.entity.Division
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.DivisionRepository

/**
 * Division Repository Implementation
 * Data layer - implements division data access using Ktor
 */
class DivisionRepositoryImpl(
    private val httpClient: HttpClient
) : DivisionRepository {
    
    override suspend fun createDivision(name: String): Result<Division> {
        return try {
            val response = httpClient.post(ApiEndpoints.Divisions.BASE) {
                contentType(ContentType.Application.Json)
                setBody(CreateDivisionRequest(name = name))
            }.body<ApiResponse<DivisionDto>>()
            
            if (response.success && response.data != null) {
                Result.Success(response.data.toDomain())
            } else {
                Result.Error(Exception(response.error ?: "Failed to create division"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }
    
    override suspend fun getDivisionById(id: String): Result<Division> {
        return try {
            val response = httpClient.get(ApiEndpoints.Divisions.byId(id))
                .body<ApiResponse<DivisionDto>>()
            
            if (response.success && response.data != null) {
                Result.Success(response.data.toDomain())
            } else {
                Result.Error(Exception(response.error ?: "Failed to get division"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }
    
    override suspend fun listDivisions(): Result<List<Division>> {
        return try {
            val response = httpClient.get(ApiEndpoints.Divisions.BASE)
                .body<ApiResponse<List<DivisionDto>>>()
            
            if (response.success && response.data != null) {
                Result.Success(response.data.map { it.toDomain() })
            } else {
                Result.Error(Exception(response.error ?: "Failed to list divisions"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }
    
    override suspend fun updateDivision(id: String, name: String): Result<Division> {
        return try {
            val response = httpClient.put(ApiEndpoints.Divisions.byId(id)) {
                contentType(ContentType.Application.Json)
                setBody(UpdateDivisionRequest(name = name))
            }.body<ApiResponse<DivisionDto>>()
            
            if (response.success && response.data != null) {
                Result.Success(response.data.toDomain())
            } else {
                Result.Error(Exception(response.error ?: "Failed to update division"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }
    
    override suspend fun deleteDivision(id: String): Result<Unit> {
        return try {
            val response = httpClient.delete(ApiEndpoints.Divisions.byId(id))
                .body<ApiResponse<Unit>>()
            
            if (response.success) {
                Result.Success(Unit)
            } else {
                Result.Error(Exception(response.error ?: "Failed to delete division"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }
}
