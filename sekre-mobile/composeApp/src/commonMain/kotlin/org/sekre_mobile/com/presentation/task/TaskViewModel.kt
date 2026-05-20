package org.sekre_mobile.com.presentation.task

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import org.sekre_mobile.com.domain.entity.TaskStatus
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.usecase.division.ListDivisionMembersUseCase
import org.sekre_mobile.com.domain.usecase.division.ListDivisionsUseCase
import org.sekre_mobile.com.domain.usecase.task.CreateTaskUseCase
import org.sekre_mobile.com.domain.usecase.task.DeleteTaskUseCase
import org.sekre_mobile.com.domain.usecase.task.GetTaskByIdUseCase
import org.sekre_mobile.com.domain.usecase.task.ListTasksUseCase
import org.sekre_mobile.com.domain.usecase.task.UpdateTaskStatusUseCase
import org.sekre_mobile.com.domain.usecase.task.UpdateTaskUseCase
import org.sekre_mobile.com.domain.util.ErrorMapper
import org.sekre_mobile.com.presentation.base.BaseViewModel

class TaskViewModel(
    private val listTasksUseCase: ListTasksUseCase,
    private val getTaskByIdUseCase: GetTaskByIdUseCase,
    private val createTaskUseCase: CreateTaskUseCase,
    private val updateTaskUseCase: UpdateTaskUseCase,
    private val updateTaskStatusUseCase: UpdateTaskStatusUseCase,
    private val deleteTaskUseCase: DeleteTaskUseCase,
    private val listDivisionsUseCase: ListDivisionsUseCase,
    private val listDivisionMembersUseCase: ListDivisionMembersUseCase,
) : BaseViewModel<TaskState, TaskEvent, TaskEffect>(TaskState()) {
    private fun log(tag: String, msg: String) {
        println("[DEBUG][TaskViewModel][$tag] $msg")
    }

    init {
        // Pre-load divisions so the create/edit form can populate its dropdown
        // immediately. Members are loaded lazily once the user picks a division.
        loadDivisions()
    }

    override fun onEvent(event: TaskEvent) {
        log("onEvent", "event=$event")
        when (event) {
            TaskEvent.LoadFirstPage -> loadFirstPage()
            TaskEvent.LoadNextPage -> loadNextPage()
            is TaskEvent.OpenDetail -> openDetail(event.id)
            TaskEvent.OpenCreateForm -> setState {
                it.copy(selectedTask = null, divisionMembers = emptyList())
            }

            is TaskEvent.LoadDivisionMembers -> loadDivisionMembers(event.divisionId)
            is TaskEvent.SubmitCreate -> submitCreate(
                divisionId = event.divisionId,
                title = event.title,
                description = event.description,
                assigneeId = event.assigneeId,
                dueDate = event.dueDate,
            )

            is TaskEvent.SubmitEdit -> submitEdit(
                id = event.id,
                title = event.title,
                status = event.status,
                description = event.description,
                assigneeId = event.assigneeId,
                dueDate = event.dueDate,
            )

            is TaskEvent.SubmitStatus -> submitStatus(event.id, event.status)
            is TaskEvent.SubmitDelete -> submitDelete(event.id)
        }
    }

    private fun loadFirstPage() {
        log("loadFirstPage", "start")
        viewModelScope.launch {
            setState { it.copy(isLoading = true, errorMessage = null, page = 1) }
            when (val result = listTasksUseCase()) {
                is Result.Success -> {
                    val items = result.data
                    val hasMore = items.size >= state.value.pageSize
                    log("loadFirstPage", "OK count=${items.size} hasMore=$hasMore")
                    setState {
                        it.copy(
                            isLoading = false,
                            tasks = items,
                            hasMore = hasMore,
                            page = 1
                        )
                    }
                }

                    is Result.Error -> {
                        log("loadFirstPage", "FAIL message=${result.exception.message}")
                        handleError(
                            ErrorMapper.toDisplayMessage("Gagal memuat task", result.exception),
                            false
                        )
                    }
            }
        }
    }

    private fun loadNextPage() {
        val current = state.value
        if (!current.hasMore || current.isLoadingMore || current.isLoading) {
            log("loadNextPage", "skipped hasMore=${current.hasMore} isLoadingMore=${current.isLoadingMore} isLoading=${current.isLoading}")
            return
        }
        log("loadNextPage", "start currentPage=${current.page}")
        viewModelScope.launch {
            setState { it.copy(isLoadingMore = true, errorMessage = null) }
            when (val result = listTasksUseCase()) {
                is Result.Success -> {
                    val nextItems = result.data
                    val merged = (current.tasks + nextItems).distinctBy { it.task.id }
                    val hasMore = nextItems.size >= current.pageSize
                    log("loadNextPage", "OK newCount=${nextItems.size} merged=${merged.size} hasMore=$hasMore")
                    setState {
                        it.copy(
                            isLoadingMore = false,
                            tasks = merged,
                            page = current.page + 1,
                            hasMore = hasMore
                        )
                    }
                }

                    is Result.Error -> {
                        log("loadNextPage", "FAIL message=${result.exception.message}")
                        handleError(
                            ErrorMapper.toDisplayMessage("Gagal memuat task lainnya", result.exception),
                            true
                        )
                    }
            }
        }
    }

    private fun openDetail(id: String) {
        log("openDetail", "start id=$id")
        viewModelScope.launch {
            when (val result = getTaskByIdUseCase(id)) {
                is Result.Success -> {
                    val task = result.data
                    log("openDetail", "OK id=${task.task.id}")
                    setState { it.copy(selectedTask = task) }
                    // Load members of this task's division so the detail screen
                    // can render the assignee picker correctly.
                    loadDivisionMembers(task.task.divisionId)
                }
                    is Result.Error -> {
                        log("openDetail", "FAIL message=${result.exception.message}")
                        handleError(
                            ErrorMapper.toDisplayMessage("Gagal memuat detail task", result.exception),
                            false
                        )
                    }
            }
        }
    }

    private fun loadDivisions() {
        log("loadDivisions", "start")
        viewModelScope.launch {
            setState { it.copy(isLoadingDivisions = true) }
            when (val result = listDivisionsUseCase()) {
                is Result.Success -> {
                    log("loadDivisions", "OK count=${result.data.size}")
                    setState {
                        it.copy(isLoadingDivisions = false, divisions = result.data)
                    }
                }
                    is Result.Error -> {
                        log("loadDivisions", "FAIL message=${result.exception.message}")
                        setState { it.copy(isLoadingDivisions = false) }
                        sendEffect(
                            TaskEffect.ShowError(
                                ErrorMapper.toDisplayMessage("Gagal memuat divisi", result.exception),
                            ),
                        )
                    }
            }
        }
    }

    private fun loadDivisionMembers(divisionId: String) {
        if (divisionId.isBlank()) return
        log("loadDivisionMembers", "start divisionId=$divisionId")
        viewModelScope.launch {
            setState { it.copy(isLoadingMembers = true, divisionMembers = emptyList()) }
            when (val result = listDivisionMembersUseCase(divisionId)) {
                is Result.Success -> {
                    log("loadDivisionMembers", "OK count=${result.data.size}")
                    setState {
                        it.copy(isLoadingMembers = false, divisionMembers = result.data)
                    }
                }
                    is Result.Error -> {
                        log("loadDivisionMembers", "FAIL message=${result.exception.message}")
                        setState { it.copy(isLoadingMembers = false) }
                        sendEffect(
                            TaskEffect.ShowError(
                                ErrorMapper.toDisplayMessage("Gagal memuat anggota divisi", result.exception),
                            ),
                        )
                    }
            }
        }
    }

    private fun submitCreate(
        divisionId: String,
        title: String,
        description: String?,
        assigneeId: String?,
        dueDate: Long?,
    ) {
        log("submitCreate", "start divisionId=$divisionId title=$title assigneeId=$assigneeId dueDate=$dueDate")
        viewModelScope.launch {
            setState { it.copy(isLoading = true, errorMessage = null) }
            when (val result = createTaskUseCase(divisionId, assigneeId, title, description, dueDate)) {
                is Result.Success -> {
                    log("submitCreate", "OK id=${result.data.task.id}")
                    setState { it.copy(isLoading = false, tasks = listOf(result.data) + it.tasks) }
                }

                    is Result.Error -> {
                        log("submitCreate", "FAIL message=${result.exception.message}")
                        handleError(
                            ErrorMapper.toDisplayMessage("Gagal membuat task", result.exception),
                            false
                        )
                    }
            }
        }
    }

    private fun submitEdit(
        id: String,
        title: String,
        status: TaskStatus,
        description: String?,
        assigneeId: String?,
        dueDate: Long?,
    ) {
        log("submitEdit", "start id=$id title=$title status=$status assigneeId=$assigneeId dueDate=$dueDate")
        viewModelScope.launch {
            setState { it.copy(isLoading = true, errorMessage = null) }
            when (val result = updateTaskUseCase(id, title, status, description, assigneeId, dueDate)) {
                is Result.Success -> {
                    val updated = result.data
                    log("submitEdit", "OK id=${updated.task.id}")
                    setState {
                        it.copy(
                            isLoading = false,
                            tasks = it.tasks.map { item -> if (item.task.id == updated.task.id) updated else item },
                            selectedTask = updated,
                        )
                    }
                    sendEffect(TaskEffect.UpdatedSuccessfully)
                }

                    is Result.Error -> {
                        log("submitEdit", "FAIL message=${result.exception.message}")
                        handleError(
                            ErrorMapper.toDisplayMessage("Gagal memperbarui task", result.exception),
                            false
                        )
                    }
            }
        }
    }

    private fun submitStatus(id: String, status: TaskStatus) {
        log("submitStatus", "start id=$id status=$status")
        viewModelScope.launch {
            when (val result = updateTaskStatusUseCase(id, status)) {
                is Result.Success -> {
                    log("submitStatus", "OK id=$id status=$status")
                    val updatedTasks = state.value.tasks.map {
                        if (it.task.id == id) it.copy(task = it.task.copy(status = status)) else it
                    }
                    val updatedSelected = state.value.selectedTask?.let {
                        if (it.task.id == id) it.copy(task = it.task.copy(status = status)) else it
                    }
                    setState { it.copy(tasks = updatedTasks, selectedTask = updatedSelected) }
                }

                    is Result.Error -> {
                        log("submitStatus", "FAIL message=${result.exception.message}")
                        handleError(
                            ErrorMapper.toDisplayMessage("Gagal memperbarui status task", result.exception),
                            false
                        )
                    }
            }
        }
    }

    private fun submitDelete(id: String) {
        log("submitDelete", "start id=$id")
        viewModelScope.launch {
            setState { it.copy(isLoading = true, errorMessage = null) }
            when (val result = deleteTaskUseCase(id)) {
                is Result.Success -> {
                    log("submitDelete", "OK id=$id")
                    setState {
                        it.copy(
                            isLoading = false,
                            selectedTask = null,
                            tasks = it.tasks.filterNot { item -> item.task.id == id },
                        )
                    }
                    sendEffect(TaskEffect.DeletedSuccessfully)
                }
                is Result.Error -> {
                    log("submitDelete", "FAIL message=${result.exception.message}")
                    handleError(
                        ErrorMapper.toDisplayMessage("Gagal menghapus task", result.exception),
                        false
                    )
                }
            }
        }
    }

    private fun handleError(message: String, append: Boolean) {
        log("handleError", "message=$message append=$append")
        viewModelScope.launch {
            setState { it.copy(isLoading = false, isLoadingMore = false, errorMessage = message) }
            sendEffect(TaskEffect.ShowError(if (append) "Append error: $message" else message))
        }
    }
}
