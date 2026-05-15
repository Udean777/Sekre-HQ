package org.sekre_mobile.com.presentation.member

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.usecase.division.ListDivisionsUseCase
import org.sekre_mobile.com.domain.usecase.member.CreateMemberUseCase
import org.sekre_mobile.com.presentation.base.BaseViewModel

class AddMemberViewModel(
    private val createMemberUseCase: CreateMemberUseCase,
    private val listDivisionsUseCase: ListDivisionsUseCase,
) : BaseViewModel<AddMemberState, AddMemberEvent, AddMemberEffect>(AddMemberState()) {
    init {
        viewModelScope.launch {
            when (val result = listDivisionsUseCase()) {
                is Result.Success -> setState { it.copy(availableDivisions = result.data) }
                is Result.Error -> sendEffect(AddMemberEffect.ShowError(result.exception.message ?: "Failed to load divisions"))
            }
        }
    }

    override fun onEvent(event: AddMemberEvent) {
        when (event) {
            is AddMemberEvent.SetEmail -> setState { it.copy(email = event.value) }
            is AddMemberEvent.SetFullName -> setState { it.copy(fullName = event.value) }
            is AddMemberEvent.SetRole -> setState { it.copy(role = event.value) }
            is AddMemberEvent.ToggleDivision -> setState {
                val next = it.selectedDivisionIds.toMutableSet()
                if (next.contains(event.id)) next.remove(event.id) else next.add(event.id)
                it.copy(selectedDivisionIds = next)
            }
            AddMemberEvent.Submit -> submit()
        }
    }

    private fun submit() = viewModelScope.launch {
        val s = state.value
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (val result = createMemberUseCase(s.email, s.fullName, s.role, s.selectedDivisionIds.toList())) {
            is Result.Success -> {
                setState { AddMemberState(availableDivisions = it.availableDivisions) }
                sendEffect(AddMemberEffect.CreatedSuccessfully)
            }
            is Result.Error -> {
                val message = result.exception.message ?: "Failed to create member"
                setState { it.copy(isLoading = false, errorMessage = message) }
                sendEffect(AddMemberEffect.ShowError(message))
            }
        }
    }
}
