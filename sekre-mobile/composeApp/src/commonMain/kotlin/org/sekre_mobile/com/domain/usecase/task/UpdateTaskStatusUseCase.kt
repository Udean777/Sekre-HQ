package org.sekre_mobile.com.domain.usecase.task

import org.sekre_mobile.com.domain.entity.TaskStatus
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.TaskRepository

/**
 * Update Task Status Use Case
 * Application layer - orchestrates business logic
 */
class UpdateTaskStatusUseCase(
    private val taskRepository: TaskRepository
) {
    suspend operator fun invoke(
        id: String,
        status: TaskStatus
    ): Result<Unit> {
        if (id.isBlank()) {
            return Result.Error(Exception("Task ID is required"))
        }

        return taskRepository.updateTaskStatus(id, status)
    }
}
