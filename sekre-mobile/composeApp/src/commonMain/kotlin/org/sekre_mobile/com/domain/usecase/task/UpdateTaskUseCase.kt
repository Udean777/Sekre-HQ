package org.sekre_mobile.com.domain.usecase.task

import org.sekre_mobile.com.domain.entity.TaskStatus
import org.sekre_mobile.com.domain.entity.TaskWithAssignee
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.TaskRepository

class UpdateTaskUseCase(
    private val taskRepository: TaskRepository,
) {
    suspend operator fun invoke(
        id: String,
        title: String?,
        description: String?,
        assigneeId: String?,
        dueDate: Long?,
        status: TaskStatus?,
    ): Result<TaskWithAssignee> {
        if (id.isBlank()) return Result.Error(Exception("Task id is required"))
        return taskRepository.updateTask(id, title, description, assigneeId, dueDate, status)
    }
}
