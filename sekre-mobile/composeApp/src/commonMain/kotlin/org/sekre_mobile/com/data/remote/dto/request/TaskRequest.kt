package org.sekre_mobile.com.data.remote.dto.request

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Task Request DTOs
 */
@Serializable
data class CreateTaskRequest(
    @SerialName("division_id") val divisionId: String,
    @SerialName("assignee_id") val assigneeId: String?,
    @SerialName("title") val title: String,
    @SerialName("description") val description: String?,
    @SerialName("priority") val priority: String? = null,
    @SerialName("due_date") val dueDate: String?
)

@Serializable
data class UpdateTaskRequest(
    @SerialName("title") val title: String?,
    @SerialName("description") val description: String?,
    @SerialName("assignee_id") val assigneeId: String?,
    @SerialName("priority") val priority: String? = null,
    @SerialName("due_date") val dueDate: String?,
    @SerialName("status") val status: String?
)

@Serializable
data class UpdateTaskStatusRequest(
    @SerialName("status") val status: String
)
