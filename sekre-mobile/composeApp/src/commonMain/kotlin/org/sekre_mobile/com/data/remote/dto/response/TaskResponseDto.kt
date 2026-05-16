package org.sekre_mobile.com.data.remote.dto.response

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Task Response DTOs
 */
@Serializable
data class TaskDto(
    @SerialName("id") val id: String,
    @SerialName("division_id") val divisionId: String,
    @SerialName("assignee_id") val assigneeId: String?,
    @SerialName("title") val title: String,
    @SerialName("description") val description: String,
    @SerialName("status") val status: String,
    @SerialName("due_date") val dueDate: String?,
    @SerialName("created_at") val createdAt: String,
    @SerialName("updated_at") val updatedAt: String
)

@Serializable
data class AssigneeDto(
    @SerialName("id") val id: String,
    @SerialName("email") val email: String,
    @SerialName("full_name") val fullName: String
)

@Serializable
data class TaskWithAssigneeDto(
    @SerialName("task") val task: TaskDto,
    @SerialName("assignee") val assignee: AssigneeDto?
)

@Serializable
data class TaskListPayloadDto(
    @SerialName("data") val data: List<TaskWithAssigneeDto> = emptyList(),
)
