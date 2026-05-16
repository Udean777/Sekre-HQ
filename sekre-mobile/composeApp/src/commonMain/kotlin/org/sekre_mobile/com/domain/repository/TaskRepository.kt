package org.sekre_mobile.com.domain.repository

import org.sekre_mobile.com.domain.entity.TaskStatus
import org.sekre_mobile.com.domain.entity.TaskWithAssignee
import org.sekre_mobile.com.domain.model.Result

/** Task Repository Interface Domain layer - defines contract for data access */
interface TaskRepository {
    /** Create a new task */
    suspend fun createTask(
        divisionId: String,
        assigneeId: String?,
        title: String,
        description: String?,
        dueDate: Long?,
    ): Result<TaskWithAssignee>

    /** Get task by ID */
    suspend fun getTaskById(id: String): Result<TaskWithAssignee>

    /** List tasks with optional filters */
    suspend fun listTasks(
        divisionId: String? = null,
        assigneeId: String? = null,
        status: TaskStatus? = null,
    ): Result<List<TaskWithAssignee>>

    /**
     * Update a task. Backend requires `title` and `status` to be present and
     * valid; other fields are optional and will be applied as a partial update
     * by the server.
     */
    suspend fun updateTask(
        id: String,
        title: String,
        status: TaskStatus,
        description: String?,
        assigneeId: String?,
        dueDate: Long?,
    ): Result<TaskWithAssignee>

    /** Update task status only */
    suspend fun updateTaskStatus(id: String, status: TaskStatus): Result<Unit>

    /** Delete task */
    suspend fun deleteTask(id: String): Result<Unit>
}
