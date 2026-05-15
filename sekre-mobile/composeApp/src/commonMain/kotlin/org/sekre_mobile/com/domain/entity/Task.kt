package org.sekre_mobile.com.domain.entity

import org.sekre_mobile.com.domain.util.currentTimeMillis

/** Task Domain Entity Pure business object - no framework dependencies */
enum class TaskStatus {
    TODO,
    IN_PROGRESS,
    DONE
}

data class Task(
        val id: String,
        val divisionId: String,
        val assigneeId: String?,
        val title: String,
        val description: String,
        val status: TaskStatus,
        val dueDate: Long?, // Unix timestamp in milliseconds
        val createdAt: Long,
        val updatedAt: Long
) {
    /** Check if task is overdue */
    fun isOverdue(): Boolean {
        if (dueDate == null || status == TaskStatus.DONE) {
            return false
        }
        return dueDate < currentTimeMillis()
    }

    /** Check if task is due soon (within 3 days) */
    fun isDueSoon(): Boolean {
        if (dueDate == null || status == TaskStatus.DONE) {
            return false
        }
        val now = currentTimeMillis()
        val threeDaysFromNow = now + (3 * 24 * 60 * 60 * 1000)
        return dueDate > now && dueDate <= threeDaysFromNow
    }

    /** Check if task is completed */
    fun isCompleted(): Boolean = status == TaskStatus.DONE

    /** Check if task can be deleted */
    fun canBeDeleted(): Boolean = true

    /** Check if task can be edited */
    fun canBeEdited(): Boolean = true
}

data class TaskAssignee(val id: String, val email: String, val fullName: String)

data class TaskWithAssignee(val task: Task, val assignee: TaskAssignee?)
