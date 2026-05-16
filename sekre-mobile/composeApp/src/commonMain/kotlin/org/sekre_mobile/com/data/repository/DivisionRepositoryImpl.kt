package org.sekre_mobile.com.data.repository

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*
import org.sekre_mobile.com.data.mapper.DivisionMapper
import org.sekre_mobile.com.data.mapper.DivisionMapper.toDomain
import org.sekre_mobile.com.data.remote.api.ApiEndpoints
import org.sekre_mobile.com.data.remote.dto.request.CreateDivisionRequest
import org.sekre_mobile.com.data.remote.dto.request.UpdateDivisionRequest
import org.sekre_mobile.com.data.remote.dto.response.ApiResponse
import org.sekre_mobile.com.data.remote.dto.response.DivisionDetailPayloadDto
import org.sekre_mobile.com.data.remote.dto.response.DivisionDto
import org.sekre_mobile.com.data.remote.dto.response.DivisionListPayloadDto
import org.sekre_mobile.com.data.remote.dto.response.DivisionMemberListPayloadDto
import org.sekre_mobile.com.domain.entity.Division
import org.sekre_mobile.com.domain.entity.DivisionMemberUser
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.DivisionRepository

/**
 * Division Repository Implementation
 * Data layer - implements division data access using Ktor
 */
class DivisionRepositoryImpl(
    private val httpClient: HttpClient
) : DivisionRepository {
    private fun log(tag: String, msg: String) {
        println("[DEBUG][DivisionRepository][$tag] $msg")
    }
    private fun logErr(tag: String, e: Exception) {
        println("[DEBUG][DivisionRepository][$tag][ERROR] type=${e::class.simpleName} message=${e.message}")
        e.cause?.let {
            println("[DEBUG][DivisionRepository][$tag][ERROR] causeType=${it::class.simpleName} causeMessage=${it.message}")
        }
        println("[DEBUG][DivisionRepository][$tag][STACKTRACE]\n${e.stackTraceToString()}")
    }

    
    override suspend fun createDivision(name: String): Result<Division> {
        log("createDivision", "start name=$name")
        return try {
            val response = httpClient.post(ApiEndpoints.Divisions.BASE) {
                contentType(ContentType.Application.Json)
                setBody(CreateDivisionRequest(name = name))
            }.body<ApiResponse<DivisionDto>>()
            
            log("createDivision", "response success=${response.success} hasData=${response.data != null} error=${response.error} message=${response.message}")
            if (response.success && response.data != null) {
                log("createDivision", "OK id=${response.data.id}")
                Result.Success(response.data.toDomain())
            } else {
                log("createDivision", "FAIL error=${response.error}")
                Result.Error(Exception(response.error ?: "Failed to create division"))
            }
        } catch (e: Exception) {
            logErr("createDivision", e)
            Result.Error(e)
        }
    }
    
    override suspend fun getDivisionById(id: String): Result<Division> {
        log("getDivisionById", "start id=$id")
        return try {
            val response = httpClient.get(ApiEndpoints.Divisions.byId(id))
                .body<ApiResponse<DivisionDetailPayloadDto>>()

            log("getDivisionById", "response success=${response.success} hasData=${response.data != null} error=${response.error}")
            if (response.success && response.data != null) {
                log("getDivisionById", "OK id=${response.data.division.id}")
                Result.Success(response.data.division.toDomain())
            } else {
                log("getDivisionById", "FAIL error=${response.error}")
                Result.Error(Exception(response.error ?: "Failed to get division"))
            }
        } catch (e: Exception) {
            logErr("getDivisionById", e)
            Result.Error(e)
        }
    }
    
    override suspend fun listDivisions(): Result<List<Division>> {
        log("listDivisions", "start")
        return try {
            val response = httpClient.get(ApiEndpoints.Divisions.BASE)
                .body<ApiResponse<DivisionListPayloadDto>>()
            
            log("listDivisions", "response success=${response.success} hasData=${response.data != null} count=${response.data?.data?.size} error=${response.error}")
            if (response.success && response.data != null) {
                log("listDivisions", "OK count=${response.data.data.size}")
                Result.Success(response.data.data.map { it.toDomain() })
            } else {
                log("listDivisions", "FAIL error=${response.error}")
                Result.Error(Exception(response.error ?: "Failed to list divisions"))
            }
        } catch (e: Exception) {
            logErr("listDivisions", e)
            Result.Error(e)
        }
    }
    
    override suspend fun updateDivision(id: String, name: String): Result<Division> {
        log("updateDivision", "start id=$id name=$name")
        return try {
            val response = httpClient.put(ApiEndpoints.Divisions.byId(id)) {
                contentType(ContentType.Application.Json)
                setBody(UpdateDivisionRequest(name = name))
            }.body<ApiResponse<DivisionDto>>()
            
            log("updateDivision", "response success=${response.success} hasData=${response.data != null} error=${response.error}")
            if (response.success && response.data != null) {
                log("updateDivision", "OK id=${response.data.id}")
                Result.Success(response.data.toDomain())
            } else {
                log("updateDivision", "FAIL error=${response.error}")
                Result.Error(Exception(response.error ?: "Failed to update division"))
            }
        } catch (e: Exception) {
            logErr("updateDivision", e)
            Result.Error(e)
        }
    }
    
    override suspend fun deleteDivision(id: String): Result<Unit> {
        log("deleteDivision", "start id=$id")
        return try {
            val response = httpClient.delete(ApiEndpoints.Divisions.byId(id))
                .body<ApiResponse<Unit>>()
            
            log("deleteDivision", "response success=${response.success} error=${response.error}")
            if (response.success) {
                log("deleteDivision", "OK id=$id")
                Result.Success(Unit)
            } else {
                log("deleteDivision", "FAIL error=${response.error}")
                Result.Error(Exception(response.error ?: "Failed to delete division"))
            }
        } catch (e: Exception) {
            logErr("deleteDivision", e)
            Result.Error(e)
        }
    }

    override suspend fun listDivisionMembers(divisionId: String): Result<List<DivisionMemberUser>> {
        log("listDivisionMembers", "start divisionId=$divisionId")
        return try {
            val response = httpClient.get(ApiEndpoints.Divisions.members(divisionId))
                .body<ApiResponse<DivisionMemberListPayloadDto>>()

            log("listDivisionMembers", "response success=${response.success} hasData=${response.data != null} count=${response.data?.data?.size} error=${response.error}")
            if (response.success && response.data != null) {
                val items = response.data.data.map { with(DivisionMapper) { it.toDomain() } }
                log("listDivisionMembers", "OK count=${items.size}")
                Result.Success(items)
            } else {
                log("listDivisionMembers", "FAIL error=${response.error}")
                Result.Error(Exception(response.error ?: "Failed to list division members"))
            }
        } catch (e: Exception) {
            logErr("listDivisionMembers", e)
            Result.Error(e)
        }
    }
}
