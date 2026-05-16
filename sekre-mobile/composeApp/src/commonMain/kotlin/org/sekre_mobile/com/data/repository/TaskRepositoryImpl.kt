package org.sekre_mobile.com.data.repository

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*
import org.sekre_mobile.com.data.mapper.MapperUtils.toIso8601String
import org.sekre_mobile.com.data.mapper.TaskMapper.toApiString
import org.sekre_mobile.com.data.mapper.TaskMapper.toDomain
import org.sekre_mobile.com.data.remote.api.ApiEndpoints
import org.sekre_mobile.com.data.remote.dto.request.CreateTaskRequest
import org.sekre_mobile.com.data.remote.dto.request.UpdateTaskRequest
import org.sekre_mobile.com.data.remote.dto.request.UpdateTaskStatusRequest
import org.sekre_mobile.com.data.remote.dto.response.ApiResponse
import org.sekre_mobile.com.data.remote.dto.response.TaskListPayloadDto
import org.sekre_mobile.com.data.remote.dto.response.TaskWithAssigneeDto
import org.sekre_mobile.com.domain.entity.TaskStatus
import org.sekre_mobile.com.domain.entity.TaskWithAssignee
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.TaskRepository

/**
 * Task Repository Implementation
 * Data layer - implements task data access using Ktor
 */
class TaskRepositoryImpl(
    private val httpClient: HttpClient
) : TaskRepository {
    private fun log(tag: String, msg: String) {
        println("[DEBUG][TaskRepository][$tag] $msg")
    }
    private fun logErr(tag: String, e: Exception) {
        println("[DEBUG][TaskRepository][$tag][ERROR] type=${e::class.simpleName} message=${e.message}")
        e.cause?.let {
            println("[DEBUG][TaskRepository][$tag][ERROR] causeType=${it::class.simpleName} causeMessage=${it.message}")
        }
        println("[DEBUG][TaskRepository][$tag][STACKTRACE]\n${e.stackTraceToString()}")
    }


    override suspend fun createTask(
        divisionId: String,
        assigneeId: String?,
        title: String,
        description: String?,
        dueDate: Long?,
    ): Result<TaskWithAssignee> {
        log("createTask", "start divisionId=$divisionId assigneeId=$assigneeId title=$title dueDate=$dueDate")
        return try {
            val response = httpClient.post(ApiEndpoints.Tasks.BASE) {
                contentType(ContentType.Application.Json)
                setBody(
                    CreateTaskRequest(
                        divisionId = divisionId,
                        assigneeId = assigneeId,
                        title = title,
                        description = description,
                        dueDate = dueDate?.toIso8601String(),
                    )
                )
            }.body<ApiResponse<TaskWithAssigneeDto>>()

            log("createTask", "response success=${response.success} hasData=${response.data != null} error=${response.error} message=${response.message}")
            if (response.success && response.data != null) {
                log("createTask", "OK id=${response.data.task.id}")
                Result.Success(response.data.toDomain())
            } else {
                log("createTask", "FAIL error=${response.error}")
                Result.Error(Exception(response.error ?: "Failed to create task"))
            }
        } catch (e: Exception) {
            logErr("createTask", e)
            Result.Error(e)
        }
    }

    override suspend fun getTaskById(id: String): Result<TaskWithAssignee> {
        log("getTaskById", "start id=$id")
        return try {
            val response = httpClient.get(ApiEndpoints.Tasks.byId(id))
                .body<ApiResponse<TaskWithAssigneeDto>>()

            log("getTaskById", "response success=${response.success} hasData=${response.data != null} error=${response.error}")
            if (response.success && response.data != null) {
                log("getTaskById", "OK id=${response.data.task.id}")
                Result.Success(response.data.toDomain())
            } else {
                log("getTaskById", "FAIL error=${response.error}")
                Result.Error(Exception(response.error ?: "Failed to get task"))
            }
        } catch (e: Exception) {
            logErr("getTaskById", e)
            Result.Error(e)
        }
    }

    override suspend fun listTasks(
        divisionId: String?,
        assigneeId: String?,
        status: TaskStatus?,
    ): Result<List<TaskWithAssignee>> {
        log("listTasks", "start divisionId=$divisionId assigneeId=$assigneeId status=$status")
        return try {
            val response = httpClient.get(ApiEndpoints.Tasks.BASE) {
                divisionId?.let { parameter("division_id", it) }
                assigneeId?.let { parameter("assignee_id", it) }
                status?.let { parameter("status", it.toApiString()) }
            }.body<ApiResponse<TaskListPayloadDto>>()

            log("listTasks", "response success=${response.success} hasData=${response.data != null} count=${response.data?.data?.size} error=${response.error}")
            if (response.success && response.data != null) {
                log("listTasks", "OK count=${response.data.data.size}")
                Result.Success(response.data.data.map { it.toDomain() })
            } else {
                log("listTasks", "FAIL error=${response.error}")
                Result.Error(Exception(response.error ?: "Failed to list tasks"))
            }
        } catch (e: Exception) {
            logErr("listTasks", e)
            Result.Error(e)
        }
    }

    override suspend fun updateTask(
        id: String,
        title: String,
        status: TaskStatus,
        description: String?,
        assigneeId: String?,
        dueDate: Long?,
    ): Result<TaskWithAssignee> {
        log("updateTask", "start id=$id title=$title status=$status assigneeId=$assigneeId dueDate=$dueDate")
        return try {
            val response = httpClient.put(ApiEndpoints.Tasks.byId(id)) {
                contentType(ContentType.Application.Json)
                setBody(
                    UpdateTaskRequest(
                        title = title,
                        status = status.toApiString(),
                        description = description,
                        assigneeId = assigneeId,
                        dueDate = dueDate?.toIso8601String(),
                    )
                )
            }.body<ApiResponse<TaskWithAssigneeDto>>()

            log("updateTask", "response success=${response.success} hasData=${response.data != null} error=${response.error}")
            if (response.success && response.data != null) {
                log("updateTask", "OK id=${response.data.task.id}")
                Result.Success(response.data.toDomain())
            } else {
                log("updateTask", "FAIL error=${response.error}")
                Result.Error(Exception(response.error ?: "Failed to update task"))
            }
        } catch (e: Exception) {
            logErr("updateTask", e)
            Result.Error(e)
        }
    }

    override suspend fun updateTaskStatus(id: String, status: TaskStatus): Result<Unit> {
        log("updateTaskStatus", "start id=$id status=$status")
        return try {
            val response = httpClient.patch(ApiEndpoints.Tasks.updateStatus(id)) {
                contentType(ContentType.Application.Json)
                setBody(UpdateTaskStatusRequest(status = status.toApiString()))
            }.body<ApiResponse<TaskWithAssigneeDto>>()

            log("updateTaskStatus", "response success=${response.success} error=${response.error}")
            if (response.success) {
                log("updateTaskStatus", "OK id=$id")
                Result.Success(Unit)
            } else {
                log("updateTaskStatus", "FAIL error=${response.error}")
                Result.Error(Exception(response.error ?: "Failed to update task status"))
            }
        } catch (e: Exception) {
            logErr("updateTaskStatus", e)
            Result.Error(e)
        }
    }

    override suspend fun deleteTask(id: String): Result<Unit> {
        log("deleteTask", "start id=$id")
        return try {
            val response = httpClient.delete(ApiEndpoints.Tasks.byId(id))
                .body<ApiResponse<Unit>>()

            log("deleteTask", "response success=${response.success} error=${response.error}")
            if (response.success) {
                log("deleteTask", "OK id=$id")
                Result.Success(Unit)
            } else {
                log("deleteTask", "FAIL error=${response.error}")
                Result.Error(Exception(response.error ?: "Failed to delete task"))
            }
        } catch (e: Exception) {
            logErr("deleteTask", e)
            Result.Error(e)
        }
    }
}
