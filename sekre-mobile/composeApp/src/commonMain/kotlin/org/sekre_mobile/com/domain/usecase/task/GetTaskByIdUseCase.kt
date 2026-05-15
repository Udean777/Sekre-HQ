package org.sekre_mobile.com.domain.usecase.task

import org.sekre_mobile.com.domain.entity.TaskWithAssignee
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.TaskRepository

class GetTaskByIdUseCase(
    private val taskRepository: TaskRepository,
) {
    suspend operator fun invoke(id: String): Result<TaskWithAssignee> {
        if (id.isBlank()) return Result.Error(Exception("Task id is required"))
        return taskRepository.getTaskById(id)
    }
}
