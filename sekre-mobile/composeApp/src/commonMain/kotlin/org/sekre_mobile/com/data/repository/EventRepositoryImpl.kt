package org.sekre_mobile.com.data.repository

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*
import org.sekre_mobile.com.data.mapper.EventMapper.toDomain
import org.sekre_mobile.com.data.mapper.MapperUtils.toIso8601String
import org.sekre_mobile.com.data.remote.api.ApiEndpoints
import org.sekre_mobile.com.data.remote.dto.request.CreateEventRequest
import org.sekre_mobile.com.data.remote.dto.response.ApiResponse
import org.sekre_mobile.com.data.remote.dto.response.EventListPayloadDto
import org.sekre_mobile.com.data.remote.dto.response.EventWithDivisionDto
import org.sekre_mobile.com.data.remote.exception.ApiException
import org.sekre_mobile.com.domain.entity.EventWithDivision
import org.sekre_mobile.com.domain.model.PaginatedResult
import org.sekre_mobile.com.domain.model.PaginationParams
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.EventRepository

/**
 * Event Repository Implementation
 * Data layer - implements event data access using Ktor
 */
class EventRepositoryImpl(
    private val httpClient: HttpClient
) : EventRepository {
    private fun log(tag: String, msg: String) {
        println("[DEBUG][EventRepository][$tag] $msg")
    }
    private fun logErr(tag: String, e: Exception) {
        println("[DEBUG][EventRepository][$tag][ERROR] type=${e::class.simpleName} message=${e.message}")
        e.cause?.let {
            println("[DEBUG][EventRepository][$tag][ERROR] causeType=${it::class.simpleName} causeMessage=${it.message}")
        }
        println("[DEBUG][EventRepository][$tag][STACKTRACE]\n${e.stackTraceToString()}")
    }

    private fun apiFailure(response: ApiResponse<*>): ApiException = ApiException(
        code = response.code,
        httpStatus = null,
        serverMessage = response.error ?: response.message,
    )

    override suspend fun createEvent(
        divisionId: String,
        title: String,
        startTime: Long,
        endTime: Long,
        description: String?,
        location: String?,
    ): Result<EventWithDivision> {
        log("createEvent", "start divisionId=$divisionId title=$title startTime=$startTime endTime=$endTime")
        return try {
            val response = httpClient.post(ApiEndpoints.Events.BASE) {
                contentType(ContentType.Application.Json)
                setBody(
                    CreateEventRequest(
                        divisionId = divisionId,
                        title = title,
                        startTime = startTime.toIso8601String(),
                        endTime = endTime.toIso8601String(),
                        description = description,
                        location = location,
                    )
                )
            }.body<ApiResponse<EventWithDivisionDto>>()

            log("createEvent", "response success=${response.success} hasData=${response.data != null} error=${response.error} message=${response.message}")
            if (response.success && response.data != null) {
                log("createEvent", "OK id=${response.data.event?.id ?: response.data.id}")
                Result.Success(response.data.toDomain())
            } else {
                log("createEvent", "FAIL error=${response.error}")
                Result.Error(apiFailure(response))
            }
        } catch (e: Exception) {
            logErr("createEvent", e)
            Result.Error(e)
        }
    }

    override suspend fun getEventById(id: String): Result<EventWithDivision> {
        log("getEventById", "start id=$id")
        return try {
            val response = httpClient.get(ApiEndpoints.Events.byId(id))
                .body<ApiResponse<EventWithDivisionDto>>()

            log("getEventById", "response success=${response.success} hasData=${response.data != null} error=${response.error}")
            if (response.success && response.data != null) {
                log("getEventById", "OK id=${response.data.event?.id ?: response.data.id}")
                Result.Success(response.data.toDomain())
            } else {
                log("getEventById", "FAIL error=${response.error}")
                Result.Error(apiFailure(response))
            }
        } catch (e: Exception) {
            logErr("getEventById", e)
            Result.Error(e)
        }
    }

    override suspend fun listEvents(
        divisionId: String?,
        pagination: PaginationParams,
    ): Result<PaginatedResult<EventWithDivision>> {
        log("listEvents", "start divisionId=$divisionId limit=${pagination.limit} offset=${pagination.offset}")
        return try {
            val response = httpClient.get(ApiEndpoints.Events.BASE) {
                divisionId?.let { parameter("division_id", it) }
                parameter("limit", pagination.limit)
                parameter("offset", pagination.offset)
            }.body<ApiResponse<EventListPayloadDto>>()

            log("listEvents", "response success=${response.success} hasData=${response.data != null} count=${response.data?.data?.size} error=${response.error}")
            if (response.success && response.data != null) {
                val items = response.data.data.map { it.toDomain() }
                val meta = response.data.pagination
                val limit = meta?.limit ?: meta?.pageSize ?: pagination.limit
                val offset = meta?.offset ?: pagination.offset
                val total = meta?.total ?: items.size
                log("listEvents", "OK count=${items.size} total=$total")
                Result.Success(
                    PaginatedResult(
                        items = items,
                        total = total,
                        limit = limit,
                        offset = offset,
                    )
                )
            } else {
                log("listEvents", "FAIL error=${response.error}")
                Result.Error(apiFailure(response))
            }
        } catch (e: Exception) {
            logErr("listEvents", e)
            Result.Error(e)
        }
    }

    override suspend fun updateEvent(
        id: String,
        divisionId: String,
        title: String,
        startTime: Long,
        endTime: Long,
        description: String?,
        location: String?,
    ): Result<EventWithDivision> {
        log("updateEvent", "start id=$id divisionId=$divisionId title=$title startTime=$startTime endTime=$endTime")
        return try {
            val response = httpClient.put(ApiEndpoints.Events.byId(id)) {
                contentType(ContentType.Application.Json)
                setBody(
                    CreateEventRequest(
                        divisionId = divisionId,
                        title = title,
                        startTime = startTime.toIso8601String(),
                        endTime = endTime.toIso8601String(),
                        description = description,
                        location = location,
                    )
                )
            }.body<ApiResponse<EventWithDivisionDto>>()

            log("updateEvent", "response success=${response.success} hasData=${response.data != null} error=${response.error}")
            if (response.success && response.data != null) {
                log("updateEvent", "OK id=${response.data.event?.id ?: response.data.id}")
                Result.Success(response.data.toDomain())
            } else {
                log("updateEvent", "FAIL error=${response.error}")
                Result.Error(apiFailure(response))
            }
        } catch (e: Exception) {
            logErr("updateEvent", e)
            Result.Error(e)
        }
    }

    override suspend fun deleteEvent(id: String): Result<Unit> {
        log("deleteEvent", "start id=$id")
        return try {
            val response = httpClient.delete(ApiEndpoints.Events.byId(id))
                .body<ApiResponse<Unit>>()

            log("deleteEvent", "response success=${response.success} error=${response.error}")
            if (response.success) {
                log("deleteEvent", "OK id=$id")
                Result.Success(Unit)
            } else {
                log("deleteEvent", "FAIL error=${response.error}")
                Result.Error(apiFailure(response))
            }
        } catch (e: Exception) {
            logErr("deleteEvent", e)
            Result.Error(e)
        }
    }
}
