package org.sekre_mobile.com.presentation.division

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.usecase.division.CreateDivisionUseCase
import org.sekre_mobile.com.domain.usecase.division.DeleteDivisionUseCase
import org.sekre_mobile.com.domain.usecase.division.GetDivisionByIdUseCase
import org.sekre_mobile.com.domain.usecase.division.ListDivisionMembersUseCase
import org.sekre_mobile.com.domain.usecase.division.ListDivisionsUseCase
import org.sekre_mobile.com.domain.usecase.division.UpdateDivisionUseCase
import org.sekre_mobile.com.domain.util.ErrorMapper
import org.sekre_mobile.com.presentation.base.BaseViewModel

class DivisionViewModel(
    private val listDivisionsUseCase: ListDivisionsUseCase,
    private val getDivisionByIdUseCase: GetDivisionByIdUseCase,
    private val listDivisionMembersUseCase: ListDivisionMembersUseCase,
    private val createDivisionUseCase: CreateDivisionUseCase,
    private val updateDivisionUseCase: UpdateDivisionUseCase,
    private val deleteDivisionUseCase: DeleteDivisionUseCase,
) : BaseViewModel<DivisionState, DivisionEvent, DivisionEffect>(DivisionState()) {
    private fun log(tag: String, msg: String) {
        println("[DEBUG][DivisionViewModel][$tag] $msg")
    }

    override fun onEvent(event: DivisionEvent) {
        log("onEvent", "event=$event")
        when (event) {
            DivisionEvent.LoadDivisions -> loadDivisions()
            is DivisionEvent.OpenDivisionDetail -> openDivisionDetail(event.id)
            is DivisionEvent.LoadDivisionMembers -> loadDivisionMembers(event.divisionId)
            is DivisionEvent.SubmitCreate -> submitCreate(event.name)
            is DivisionEvent.SubmitEdit -> submitEdit(event.id, event.name)
            is DivisionEvent.SubmitDelete -> submitDelete(event.id)
        }
    }

    private fun loadDivisions() = viewModelScope.launch {
        log("loadDivisions", "start")
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (val result = listDivisionsUseCase()) {
            is Result.Success -> {
                log("loadDivisions", "OK count=${result.data.size}")
                setState { it.copy(isLoading = false, divisions = result.data) }
            }

            is Result.Error -> {
                log("loadDivisions", "FAIL message=${result.exception.message}")
                handleError(ErrorMapper.toDisplayMessage("Gagal memuat divisi", result.exception))
            }
        }
    }

    private fun openDivisionDetail(id: String) = viewModelScope.launch {
        log("openDivisionDetail", "start id=$id")
        setState {
            it.copy(
                isLoading = true,
                errorMessage = null,
                selectedDivision = null,
                divisionMembers = emptyList(),
            )
        }
        when (val result = getDivisionByIdUseCase(id)) {
            is Result.Success -> {
                log("openDivisionDetail", "OK id=${result.data.id}")
                setState {
                    it.copy(
                        isLoading = false,
                        selectedDivision = result.data,
                    )
                }
                loadDivisionMembers(id)
            }

            is Result.Error -> {
                log("openDivisionDetail", "FAIL message=${result.exception.message}")
                handleError(
                    ErrorMapper.toDisplayMessage("Gagal memuat detail divisi", result.exception),
                )
            }
        }
    }

    private fun loadDivisionMembers(divisionId: String) = viewModelScope.launch {
        log("loadDivisionMembers", "start divisionId=$divisionId")
        setState { it.copy(isLoadingDetailMembers = true) }
        when (val result = listDivisionMembersUseCase(divisionId)) {
            is Result.Success -> {
                log("loadDivisionMembers", "OK count=${result.data.size}")
                setState {
                    it.copy(
                        isLoadingDetailMembers = false,
                        divisionMembers = result.data,
                    )
                }
            }

            is Result.Error -> {
                log("loadDivisionMembers", "FAIL message=${result.exception.message}")
                setState { it.copy(isLoadingDetailMembers = false) }
                sendEffect(
                    DivisionEffect.ShowError(
                        ErrorMapper.toDisplayMessage(
                            "Gagal memuat anggota divisi",
                            result.exception
                        ),
                    ),
                )
            }
        }
    }

    private fun submitCreate(name: String) = viewModelScope.launch {
        log("submitCreate", "start name=$name")
        setState { it.copy(isSubmitting = true, errorMessage = null) }
        when (val result = createDivisionUseCase(name)) {
            is Result.Success -> {
                log("submitCreate", "OK id=${result.data.id}")
                setState { it.copy(isSubmitting = false) }
                sendEffect(DivisionEffect.CreatedSuccessfully)
                loadDivisions()
            }

            is Result.Error -> {
                log("submitCreate", "FAIL message=${result.exception.message}")
                handleError(
                    ErrorMapper.toDisplayMessage("Gagal membuat divisi", result.exception),
                    submit = true,
                )
            }
        }
    }

    private fun submitEdit(id: String, name: String) = viewModelScope.launch {
        log("submitEdit", "start id=$id name=$name")
        setState { it.copy(isSubmitting = true, errorMessage = null) }
        when (val result = updateDivisionUseCase(id, name)) {
            is Result.Success -> {
                log("submitEdit", "OK id=${result.data.id}")
                setState {
                    it.copy(
                        isSubmitting = false,
                        selectedDivision = result.data,
                    )
                }
                sendEffect(DivisionEffect.UpdatedSuccessfully)
                loadDivisions()
            }

            is Result.Error -> {
                log("submitEdit", "FAIL message=${result.exception.message}")
                handleError(
                    ErrorMapper.toDisplayMessage("Gagal memperbarui divisi", result.exception),
                    submit = true,
                )
            }
        }
    }

    private fun submitDelete(id: String) = viewModelScope.launch {
        log("submitDelete", "start id=$id")
        setState { it.copy(isDeleting = true, errorMessage = null) }
        when (val result = deleteDivisionUseCase(id)) {
            is Result.Success -> {
                log("submitDelete", "OK id=$id")
                setState {
                    it.copy(
                        isDeleting = false,
                        selectedDivision = null,
                        divisionMembers = emptyList(),
                    )
                }
                sendEffect(DivisionEffect.DeletedSuccessfully)
                loadDivisions()
            }

            is Result.Error -> {
                log("submitDelete", "FAIL message=${result.exception.message}")
                handleError(
                    ErrorMapper.toDisplayMessage("Gagal menghapus divisi", result.exception),
                    delete = true,
                )
            }
        }
    }

    private suspend fun handleError(
        message: String,
        submit: Boolean = false,
        delete: Boolean = false,
    ) {
        log("handleError", "message=$message")
        setState {
            it.copy(
                isLoading = false,
                isSubmitting = if (submit) false else it.isSubmitting,
                isDeleting = if (delete) false else it.isDeleting,
                errorMessage = message,
            )
        }
        sendEffect(DivisionEffect.ShowError(message))
    }
}
