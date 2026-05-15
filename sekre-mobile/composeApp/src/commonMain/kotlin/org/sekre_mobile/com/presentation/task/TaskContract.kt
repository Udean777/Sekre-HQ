package org.sekre_mobile.com.presentation.task

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
    val formTitle: String = "",
    val formDescription: String = "",
    val formDivisionId: String = "",
) : ViewState

sealed interface TaskEvent : ViewEvent {
    data object LoadFirstPage : TaskEvent
    data object LoadNextPage : TaskEvent
    data class OpenDetail(val id: String) : TaskEvent
    data object OpenCreateForm : TaskEvent
    data class SubmitCreate(val divisionId: String, val title: String, val description: String?) :
        TaskEvent

    data class SubmitEdit(val id: String, val title: String?, val description: String?) : TaskEvent
    data class SubmitStatus(val id: String, val status: TaskStatus) : TaskEvent
}

sealed interface TaskEffect : ViewEffect {
    data class ShowError(val message: String) : TaskEffect
}
