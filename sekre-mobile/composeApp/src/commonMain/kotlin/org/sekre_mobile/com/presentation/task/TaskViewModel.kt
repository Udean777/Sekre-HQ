package org.sekre_mobile.com.presentation.task

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import org.sekre_mobile.com.domain.entity.TaskStatus
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.usecase.task.CreateTaskUseCase
import org.sekre_mobile.com.domain.usecase.task.DeleteTaskUseCase
import org.sekre_mobile.com.domain.usecase.task.GetTaskByIdUseCase
import org.sekre_mobile.com.domain.usecase.task.ListTasksUseCase
import org.sekre_mobile.com.domain.usecase.task.UpdateTaskStatusUseCase
import org.sekre_mobile.com.domain.usecase.task.UpdateTaskUseCase
import org.sekre_mobile.com.presentation.base.BaseViewModel

class TaskViewModel(
    private val listTasksUseCase: ListTasksUseCase,
    private val getTaskByIdUseCase: GetTaskByIdUseCase,
    private val createTaskUseCase: CreateTaskUseCase,
    private val updateTaskUseCase: UpdateTaskUseCase,
    private val updateTaskStatusUseCase: UpdateTaskStatusUseCase,
    private val deleteTaskUseCase: DeleteTaskUseCase,
) : BaseViewModel<TaskState, TaskEvent, TaskEffect>(TaskState()) {
    override fun onEvent(event: TaskEvent) {
        when (event) {
            TaskEvent.LoadFirstPage -> loadFirstPage()
            TaskEvent.LoadNextPage -> loadNextPage()
            is TaskEvent.OpenDetail -> openDetail(event.id)
            TaskEvent.OpenCreateForm -> setState { it.copy(selectedTask = null) }
            is TaskEvent.SubmitCreate -> submitCreate(
                event.divisionId,
                event.title,
                event.description
            )

            is TaskEvent.SubmitEdit -> submitEdit(event.id, event.title, event.description)
            is TaskEvent.SubmitStatus -> submitStatus(event.id, event.status)
        }
    }

    private fun loadFirstPage() {
        viewModelScope.launch {
            setState { it.copy(isLoading = true, errorMessage = null, page = 1) }
            when (val result = listTasksUseCase()) {
                is Result.Success -> {
                    val items = result.data
                    val hasMore = items.size >= state.value.pageSize
                    setState {
                        it.copy(
                            isLoading = false,
                            tasks = items,
                            hasMore = hasMore,
                            page = 1
                        )
                    }
                }

                is Result.Error -> handleError(
                    result.exception.message ?: "Failed to load tasks",
                    false
                )
            }
        }
    }

    private fun loadNextPage() {
        val current = state.value
        if (!current.hasMore || current.isLoadingMore || current.isLoading) return
        viewModelScope.launch {
            setState { it.copy(isLoadingMore = true, errorMessage = null) }
            when (val result = listTasksUseCase()) {
                is Result.Success -> {
                    val nextItems = result.data
                    val merged = (current.tasks + nextItems).distinctBy { it.task.id }
                    val hasMore = nextItems.size >= current.pageSize
                    setState {
                        it.copy(
                            isLoadingMore = false,
                            tasks = merged,
                            page = current.page + 1,
                            hasMore = hasMore
                        )
                    }
                }

                is Result.Error -> handleError(
                    result.exception.message ?: "Failed to load more tasks", true
                )
            }
        }
    }

    private fun openDetail(id: String) {
        viewModelScope.launch {
            when (val result = getTaskByIdUseCase(id)) {
                is Result.Success -> setState { it.copy(selectedTask = result.data) }
                is Result.Error -> handleError(
                    result.exception.message ?: "Failed to load task detail", false
                )
            }
        }
    }

    private fun submitCreate(divisionId: String, title: String, description: String?) {
        viewModelScope.launch {
            setState { it.copy(isLoading = true, errorMessage = null) }
            when (val result = createTaskUseCase(divisionId, null, title, description, null)) {
                is Result.Success -> {
                    setState { it.copy(isLoading = false, tasks = listOf(result.data) + it.tasks) }
                }

                is Result.Error -> handleError(
                    result.exception.message ?: "Failed to create task",
                    false
                )
            }
        }
    }

    private fun submitEdit(id: String, title: String?, description: String?) {
        viewModelScope.launch {
            setState { it.copy(isLoading = true, errorMessage = null) }
            when (val result = updateTaskUseCase(id, title, description, null, null, null)) {
                is Result.Success -> {
                    val updated = result.data
                    setState {
                        it.copy(
                            isLoading = false,
                            tasks = it.tasks.map { item -> if (item.task.id == updated.task.id) updated else item },
                            selectedTask = updated,
                        )
                    }
                }

                is Result.Error -> handleError(
                    result.exception.message ?: "Failed to edit task",
                    false
                )
            }
        }
    }

    private fun submitStatus(id: String, status: TaskStatus) {
        viewModelScope.launch {
            when (val result = updateTaskStatusUseCase(id, status)) {
                is Result.Success -> {
                    val updatedTasks = state.value.tasks.map {
                        if (it.task.id == id) it.copy(task = it.task.copy(status = status)) else it
                    }
                    setState { it.copy(tasks = updatedTasks) }
                }

                is Result.Error -> handleError(
                    result.exception.message ?: "Failed to update task status", false
                )
            }
        }
    }

    private fun handleError(message: String, append: Boolean) {
        viewModelScope.launch {
            setState { it.copy(isLoading = false, isLoadingMore = false, errorMessage = message) }
            sendEffect(TaskEffect.ShowError(if (append) "Append error: $message" else message))
        }
    }
}
