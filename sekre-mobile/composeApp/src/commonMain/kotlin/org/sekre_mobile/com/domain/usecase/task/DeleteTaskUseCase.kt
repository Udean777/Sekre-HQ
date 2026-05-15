package org.sekre_mobile.com.domain.usecase.task

import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.TaskRepository

/**
 * Delete Task Use Case
 * Application layer - orchestrates business logic
 */
class DeleteTaskUseCase(
    private val taskRepository: TaskRepository
) {
    suspend operator fun invoke(id: String): Result<Unit> {
        if (id.isBlank()) {
            return Result.Error(Exception("Task ID is required"))
        }

        return taskRepository.deleteTask(id)
    }
}
