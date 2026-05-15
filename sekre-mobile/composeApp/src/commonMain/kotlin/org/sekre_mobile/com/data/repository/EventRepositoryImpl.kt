package org.sekre_mobile.com.data.repository

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*
import org.sekre_mobile.com.data.mapper.EventMapper
import org.sekre_mobile.com.data.mapper.EventMapper.toDomain
import org.sekre_mobile.com.data.mapper.MapperUtils.toIso8601String
import org.sekre_mobile.com.data.remote.api.ApiEndpoints
import org.sekre_mobile.com.data.remote.dto.request.CreateEventRequest
import org.sekre_mobile.com.data.remote.dto.request.UpdateEventRequest
import org.sekre_mobile.com.data.remote.dto.response.ApiResponse
import org.sekre_mobile.com.data.remote.dto.response.EventListPayloadDto
import org.sekre_mobile.com.data.remote.dto.response.EventWithDivisionDto
import org.sekre_mobile.com.domain.entity.EventWithDivision
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.EventRepository

/**
 * Event Repository Implementation
 * Data layer - implements event data access using Ktor
 */
class EventRepositoryImpl(
    private val httpClient: HttpClient
) : EventRepository {
    private fun log(tag: String, msg: String) { /* debug disabled */ }
    private fun logErr(tag: String, e: Exception) {
        log(tag, "type=${e::class.simpleName} message=${e.message}")
        e.cause?.let { log(tag, "causeType=${it::class.simpleName} causeMessage=${it.message}") }
        log(tag, "stacktrace=${e.stackTraceToString()}")
    }

    
    override suspend fun createEvent(
        divisionId: String,
        title: String,
        description: String?,
        startTime: Long,
        endTime: Long,
        location: String?
    ): Result<EventWithDivision> {
        log("call", "start")
        return try {
            val response = httpClient.post(ApiEndpoints.Events.BASE) {
                contentType(ContentType.Application.Json)
                setBody(
                    CreateEventRequest(
                        divisionId = divisionId,
                        title = title,
                        description = description,
                        startTime = startTime.toIso8601String(),
                        endTime = endTime.toIso8601String(),
                        location = location
                    )
                )
            }.body<ApiResponse<EventWithDivisionDto>>()
            
            if (response.success && response.data != null) {
                Result.Success(response.data.toDomain())
            } else {
                Result.Error(Exception(response.error ?: "Failed to create event"))
            }
        } catch (e: Exception) {
            logErr("call", e)
            Result.Error(e)
        }
    }
    
    override suspend fun getEventById(id: String): Result<EventWithDivision> {
        log("call", "start")
        return try {
            val response = httpClient.get(ApiEndpoints.Events.byId(id))
                .body<ApiResponse<EventWithDivisionDto>>()
            
            if (response.success && response.data != null) {
                Result.Success(response.data.toDomain())
            } else {
                Result.Error(Exception(response.error ?: "Failed to get event"))
            }
        } catch (e: Exception) {
            logErr("call", e)
            Result.Error(e)
        }
    }
    
    override suspend fun listEvents(
        divisionId: String?,
        startDate: Long?,
        endDate: Long?
    ): Result<List<EventWithDivision>> {
        log("call", "start")
        return try {
            val response = httpClient.get(ApiEndpoints.Events.BASE) {
                divisionId?.let { parameter("division_id", it) }
                startDate?.let { parameter("start_date", it.toIso8601String()) }
                endDate?.let { parameter("end_date", it.toIso8601String()) }
            }.body<ApiResponse<EventListPayloadDto>>()
            
            if (response.success && response.data != null) {
                Result.Success(response.data.data.map { it.toDomain() })
            } else {
                Result.Error(Exception(response.error ?: "Failed to list events"))
            }
        } catch (e: Exception) {
            logErr("call", e)
            Result.Error(e)
        }
    }
    
    override suspend fun updateEvent(
        id: String,
        title: String?,
        description: String?,
        startTime: Long?,
        endTime: Long?,
        location: String?
    ): Result<EventWithDivision> {
        log("call", "start")
        return try {
            val response = httpClient.put(ApiEndpoints.Events.byId(id)) {
                contentType(ContentType.Application.Json)
                setBody(
                    UpdateEventRequest(
                        title = title,
                        description = description,
                        startTime = startTime?.toIso8601String(),
                        endTime = endTime?.toIso8601String(),
                        location = location
                    )
                )
            }.body<ApiResponse<EventWithDivisionDto>>()
            
            if (response.success && response.data != null) {
                Result.Success(response.data.toDomain())
            } else {
                Result.Error(Exception(response.error ?: "Failed to update event"))
            }
        } catch (e: Exception) {
            logErr("call", e)
            Result.Error(e)
        }
    }
    
    override suspend fun deleteEvent(id: String): Result<Unit> {
        log("call", "start")
        return try {
            val response = httpClient.delete(ApiEndpoints.Events.byId(id))
                .body<ApiResponse<Unit>>()
            
            if (response.success) {
                Result.Success(Unit)
            } else {
                Result.Error(Exception(response.error ?: "Failed to delete event"))
            }
        } catch (e: Exception) {
            logErr("call", e)
            Result.Error(e)
        }
    }
}
