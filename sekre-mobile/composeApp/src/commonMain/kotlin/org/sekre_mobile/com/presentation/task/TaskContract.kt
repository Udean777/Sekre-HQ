package org.sekre_mobile.com.presentation.task

import org.sekre_mobile.com.domain.entity.Division
import org.sekre_mobile.com.domain.entity.DivisionMemberUser
import org.sekre_mobile.com.domain.entity.TaskStatus
import org.sekre_mobile.com.domain.entity.TaskWithAssignee
import org.sekre_mobile.com.presentation.base.ViewEffect
import org.sekre_mobile.com.presentation.base.ViewEvent
import org.sekre_mobile.com.presentation.base.ViewState

data class TaskState(
    val isLoading: Boolean = false,
    val isLoadingMore: Boolean = false,
    val tasks: List<TaskWithAssignee> = emptyList(),
    val page: Int = 1,
    val pageSize: Int = 20,
    val hasMore: Boolean = true,
    val errorMessage: String? = null,
    val selectedTask: TaskWithAssignee? = null,

    // Division / assignee picker support
    val divisions: List<Division> = emptyList(),
    val isLoadingDivisions: Boolean = false,
    /** Members of the currently selected division for assignee picker. */
    val divisionMembers: List<DivisionMemberUser> = emptyList(),
    val isLoadingMembers: Boolean = false,
) : ViewState

sealed interface TaskEvent : ViewEvent {
    data object LoadFirstPage : TaskEvent
    data object LoadNextPage : TaskEvent
    data class OpenDetail(val id: String) : TaskEvent
    data object OpenCreateForm : TaskEvent

    /** Fired by the create/edit screen when the user selects a division so the
     *  assignee picker can load that division's members. */
    data class LoadDivisionMembers(val divisionId: String) : TaskEvent

    data class SubmitCreate(
        val divisionId: String,
        val title: String,
        val description: String?,
        val assigneeId: String?,
        val dueDate: Long?,
    ) : TaskEvent

    data class SubmitEdit(
        val id: String,
        val title: String,
        val status: TaskStatus,
        val description: String?,
        val assigneeId: String?,
        val dueDate: Long?,
    ) : TaskEvent

    data class SubmitStatus(val id: String, val status: TaskStatus) : TaskEvent
}

sealed interface TaskEffect : ViewEffect {
    data class ShowError(val message: String) : TaskEffect
}
