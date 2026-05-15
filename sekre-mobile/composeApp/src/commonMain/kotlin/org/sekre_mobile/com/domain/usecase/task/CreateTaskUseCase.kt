package org.sekre_mobile.com.domain.usecase.task

import org.sekre_mobile.com.domain.entity.TaskWithAssignee
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.TaskRepository

/**
 * Create Task Use Case
 * Application layer - orchestrates business logic
 */
class CreateTaskUseCase(
    private val taskRepository: TaskRepository
) {
    suspend operator fun invoke(
        divisionId: String,
        assigneeId: String?,
        title: String,
        description: String?,
        dueDate: Long?
    ): Result<TaskWithAssignee> {
        // Validate input
        if (title.isBlank()) {
            return Result.Error(Exception("Title is required"))
        }
        if (title.length > 500) {
            return Result.Error(Exception("Title must be less than 500 characters"))
        }
        if (divisionId.isBlank()) {
            return Result.Error(Exception("Division is required"))
        }

        // Create task via repository
        return taskRepository.createTask(
            divisionId = divisionId,
            assigneeId = assigneeId,
            title = title,
            description = description,
            dueDate = dueDate
        )
    }
}
