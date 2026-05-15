package org.sekre_mobile.com.data.repository

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*
import org.sekre_mobile.com.data.mapper.MapperUtils.toIso8601String
import org.sekre_mobile.com.data.mapper.TaskMapper
import org.sekre_mobile.com.data.mapper.TaskMapper.toApiString
import org.sekre_mobile.com.data.mapper.TaskMapper.toDomain
import org.sekre_mobile.com.data.remote.api.ApiEndpoints
import org.sekre_mobile.com.data.remote.dto.request.CreateTaskRequest
import org.sekre_mobile.com.data.remote.dto.request.UpdateTaskRequest
import org.sekre_mobile.com.data.remote.dto.request.UpdateTaskStatusRequest
import org.sekre_mobile.com.data.remote.dto.response.ApiResponse
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

    override suspend fun createTask(
        divisionId: String,
        assigneeId: String?,
        title: String,
        description: String?,
        dueDate: Long?
    ): Result<TaskWithAssignee> {
        return try {
            val response = httpClient.post(ApiEndpoints.Tasks.BASE) {
                contentType(ContentType.Application.Json)
                setBody(
                    CreateTaskRequest(
                        divisionId = divisionId,
                        assigneeId = assigneeId,
                        title = title,
                        description = description,
                        dueDate = dueDate?.toIso8601String()
                    )
                )
            }.body<ApiResponse<TaskWithAssigneeDto>>()

            if (response.success && response.data != null) {
                Result.Success(response.data.toDomain())
            } else {
                Result.Error(Exception(response.error ?: "Failed to create task"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    override suspend fun getTaskById(id: String): Result<TaskWithAssignee> {
        return try {
            val response = httpClient.get(ApiEndpoints.Tasks.byId(id))
                .body<ApiResponse<TaskWithAssigneeDto>>()

            if (response.success && response.data != null) {
                Result.Success(response.data.toDomain())
            } else {
                Result.Error(Exception(response.error ?: "Failed to get task"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    override suspend fun listTasks(
        divisionId: String?,
        assigneeId: String?,
        status: TaskStatus?
    ): Result<List<TaskWithAssignee>> {
        return try {
            val response = httpClient.get(ApiEndpoints.Tasks.BASE) {
                divisionId?.let { parameter("division_id", it) }
                assigneeId?.let { parameter("assignee_id", it) }
                status?.let { parameter("status", it.toApiString()) }
            }.body<ApiResponse<List<TaskWithAssigneeDto>>>()

            if (response.success && response.data != null) {
                Result.Success(response.data.map { it.toDomain() })
            } else {
                Result.Error(Exception(response.error ?: "Failed to list tasks"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    override suspend fun updateTask(
        id: String,
        title: String?,
        description: String?,
        assigneeId: String?,
        dueDate: Long?,
        status: TaskStatus?
    ): Result<TaskWithAssignee> {
        return try {
            val response = httpClient.put(ApiEndpoints.Tasks.byId(id)) {
                contentType(ContentType.Application.Json)
                setBody(
                    UpdateTaskRequest(
                        title = title,
                        description = description,
                        assigneeId = assigneeId,
                        dueDate = dueDate?.toIso8601String(),
                        status = status?.toApiString()
                    )
                )
            }.body<ApiResponse<TaskWithAssigneeDto>>()

            if (response.success && response.data != null) {
                Result.Success(response.data.toDomain())
            } else {
                Result.Error(Exception(response.error ?: "Failed to update task"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    override suspend fun updateTaskStatus(id: String, status: TaskStatus): Result<Unit> {
        return try {
            val response = httpClient.patch(ApiEndpoints.Tasks.updateStatus(id)) {
                contentType(ContentType.Application.Json)
                setBody(UpdateTaskStatusRequest(status = status.toApiString()))
            }.body<ApiResponse<Unit>>()

            if (response.success) {
                Result.Success(Unit)
            } else {
                Result.Error(Exception(response.error ?: "Failed to update task status"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    override suspend fun deleteTask(id: String): Result<Unit> {
        return try {
            val response = httpClient.delete(ApiEndpoints.Tasks.byId(id))
                .body<ApiResponse<Unit>>()

            if (response.success) {
                Result.Success(Unit)
            } else {
                Result.Error(Exception(response.error ?: "Failed to delete task"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }
}
