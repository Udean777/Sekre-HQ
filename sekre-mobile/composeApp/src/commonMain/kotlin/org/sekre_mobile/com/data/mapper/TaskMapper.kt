package org.sekre_mobile.com.data.mapper

import org.sekre_mobile.com.data.mapper.MapperUtils.parseTimestamp
import org.sekre_mobile.com.data.mapper.MapperUtils.toIso8601String
import org.sekre_mobile.com.data.remote.dto.response.AssigneeDto
import org.sekre_mobile.com.data.remote.dto.response.TaskDto
import org.sekre_mobile.com.data.remote.dto.response.TaskWithAssigneeDto
import org.sekre_mobile.com.domain.entity.Task
import org.sekre_mobile.com.domain.entity.TaskAssignee
import org.sekre_mobile.com.domain.entity.TaskStatus
import org.sekre_mobile.com.domain.entity.TaskWithAssignee

/**
 * Task Mapper
 * Data layer - converts between DTOs and domain entities
 */
object TaskMapper {

    /** Convert TaskDto to Task entity */
    fun TaskDto.toDomain(): Task {
        return Task(
            id = id,
            divisionId = divisionId,
            assigneeId = assigneeId,
            title = title,
            description = description,
            status = parseTaskStatus(status),
            dueDate = dueDate?.let { parseTimestamp(it) },
            createdAt = parseTimestamp(createdAt),
            updatedAt = parseTimestamp(updatedAt)
        )
    }

    /** Convert AssigneeDto to TaskAssignee entity */
    fun AssigneeDto.toDomain(): TaskAssignee {
        return TaskAssignee(
            id = id,
            email = email,
            fullName = fullName
        )
    }

    /** Convert TaskWithAssigneeDto to TaskWithAssignee entity */
    fun TaskWithAssigneeDto.toDomain(): TaskWithAssignee {
        return TaskWithAssignee(
            task = task.toDomain(),
            assignee = assignee?.toDomain()
        )
    }

    /** Parse task status from string */
    private fun parseTaskStatus(status: String): TaskStatus {
        return when (status.uppercase()) {
            "TODO" -> TaskStatus.TODO
            "IN_PROGRESS" -> TaskStatus.IN_PROGRESS
            "DONE" -> TaskStatus.DONE
            else -> TaskStatus.TODO
        }
    }

    /** Convert TaskStatus to string for API */
    fun TaskStatus.toApiString(): String {
        return when (this) {
            TaskStatus.TODO -> "TODO"
            TaskStatus.IN_PROGRESS -> "IN_PROGRESS"
            TaskStatus.DONE -> "DONE"
        }
    }
}
