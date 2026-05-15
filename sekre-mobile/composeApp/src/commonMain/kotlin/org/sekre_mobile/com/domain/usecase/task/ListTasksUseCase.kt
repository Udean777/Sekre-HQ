package org.sekre_mobile.com.domain.usecase.task

import org.sekre_mobile.com.domain.entity.TaskStatus
import org.sekre_mobile.com.domain.entity.TaskWithAssignee
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.TaskRepository

/**
 * List Tasks Use Case
 * Application layer - orchestrates business logic
 */
class ListTasksUseCase(
    private val taskRepository: TaskRepository
) {
    suspend operator fun invoke(
        divisionId: String? = null,
        assigneeId: String? = null,
        status: TaskStatus? = null
    ): Result<List<TaskWithAssignee>> {
        return taskRepository.listTasks(
            divisionId = divisionId,
            assigneeId = assigneeId,
            status = status
        )
    }
}
