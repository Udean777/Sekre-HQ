package org.sekre_mobile.com.presentation.division

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.usecase.division.GetDivisionByIdUseCase
import org.sekre_mobile.com.domain.usecase.division.ListDivisionsUseCase
import org.sekre_mobile.com.domain.usecase.member.ListMembersUseCase
import org.sekre_mobile.com.presentation.base.BaseViewModel

class DivisionViewModel(
    private val listDivisionsUseCase: ListDivisionsUseCase,
    private val getDivisionByIdUseCase: GetDivisionByIdUseCase,
    private val listMembersUseCase: ListMembersUseCase,
) : BaseViewModel<DivisionState, DivisionEvent, DivisionEffect>(DivisionState()) {
    override fun onEvent(event: DivisionEvent) {
        when (event) {
            DivisionEvent.LoadDivisions -> loadDivisions()
            is DivisionEvent.OpenDivisionDetail -> openDivisionDetail(event.id)
            DivisionEvent.LoadMembers -> loadMembers()
        }
    }

    private fun loadDivisions() = viewModelScope.launch {
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (val result = listDivisionsUseCase()) {
            is Result.Success -> setState { it.copy(isLoading = false, divisions = result.data) }
            is Result.Error -> handleError(result.exception.message ?: "Failed to load divisions")
        }
    }

    private fun openDivisionDetail(id: String) = viewModelScope.launch {
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (val result = getDivisionByIdUseCase(id)) {
            is Result.Success -> setState {
                it.copy(
                    isLoading = false,
                    selectedDivision = result.data
                )
            }

            is Result.Error -> handleError(
                result.exception.message ?: "Failed to load division detail"
            )
        }
    }

    private fun loadMembers() = viewModelScope.launch {
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (val result = listMembersUseCase()) {
            is Result.Success -> setState { it.copy(isLoading = false, members = result.data) }
            is Result.Error -> handleError(result.exception.message ?: "Failed to load members")
        }
    }

    private fun handleError(message: String) = viewModelScope.launch {
        setState { it.copy(isLoading = false, errorMessage = message) }
        sendEffect(DivisionEffect.ShowError(message))
    }
}
