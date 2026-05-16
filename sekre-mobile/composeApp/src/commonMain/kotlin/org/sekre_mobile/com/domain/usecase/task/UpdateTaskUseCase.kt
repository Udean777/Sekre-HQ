package org.sekre_mobile.com.domain.usecase.task

import org.sekre_mobile.com.domain.entity.TaskStatus
import org.sekre_mobile.com.domain.entity.TaskWithAssignee
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.TaskRepository

/**
 * Update Task Use Case
 *
 * Backend (sekre-backend) requires `title` (non-blank, max 500) and a valid
 * `status` enum on every PUT /tasks/{id}; other fields are partial-update.
 */
class UpdateTaskUseCase(
    private val taskRepository: TaskRepository,
) {
    suspend operator fun invoke(
        id: String,
        title: String,
        status: TaskStatus,
        description: String?,
        assigneeId: String?,
        dueDate: Long?,
    ): Result<TaskWithAssignee> {
        if (id.isBlank()) return Result.Error(Exception("Task id is required"))
        if (title.isBlank()) return Result.Error(Exception("Title is required"))
        if (title.length > 500) {
            return Result.Error(Exception("Title must be less than 500 characters"))
        }
        return taskRepository.updateTask(
            id = id,
            title = title,
            status = status,
            description = description,
            assigneeId = assigneeId,
            dueDate = dueDate,
        )
    }
}
