package org.sekre_mobile.com.data.remote.dto.request

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Task Request DTOs
 *
 * Aligned with sekre-backend contract:
 * - Create requires division_id + title; assignee_id, description, due_date optional.
 * - Update requires title + status (non-null per backend validation); other fields optional.
 * - No `priority` field — not modeled on the backend.
 */
@Serializable
data class CreateTaskRequest(
    @SerialName("division_id") val divisionId: String,
    @SerialName("assignee_id") val assigneeId: String? = null,
    @SerialName("title") val title: String,
    @SerialName("description") val description: String? = null,
    @SerialName("due_date") val dueDate: String? = null,
)

@Serializable
data class UpdateTaskRequest(
    @SerialName("title") val title: String,
    @SerialName("status") val status: String,
    @SerialName("description") val description: String? = null,
    @SerialName("assignee_id") val assigneeId: String? = null,
    @SerialName("due_date") val dueDate: String? = null,
)

@Serializable
data class UpdateTaskStatusRequest(
    @SerialName("status") val status: String,
)
