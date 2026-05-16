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
    private fun log(tag: String, msg: String) {
        println("[DEBUG][AddMemberViewModel][$tag] $msg")
    }

    init {
        log("init", "loading divisions")
        viewModelScope.launch {
            when (val result = listDivisionsUseCase()) {
                is Result.Success -> {
                    log("init", "OK divisions count=${result.data.size}")
                    setState { it.copy(availableDivisions = result.data) }
                }
                is Result.Error -> {
                    log("init", "FAIL message=${result.exception.message}")
                    sendEffect(AddMemberEffect.ShowError(result.exception.message ?: "Failed to load divisions"))
                }
            }
        }
    }

    override fun onEvent(event: AddMemberEvent) {
        log("onEvent", "event=$event")
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
        log("submit", "start email=${s.email} fullName=${s.fullName} role=${s.role} divisionIds=${s.selectedDivisionIds}")
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (val result = createMemberUseCase(s.email, s.fullName, s.role, s.selectedDivisionIds.toList())) {
            is Result.Success -> {
                log("submit", "OK id=${result.data.id}")
                setState { AddMemberState(availableDivisions = it.availableDivisions) }
                sendEffect(AddMemberEffect.CreatedSuccessfully)
            }
            is Result.Error -> {
                val message = result.exception.message ?: "Failed to create member"
                log("submit", "FAIL message=$message")
                setState { it.copy(isLoading = false, errorMessage = message) }
                sendEffect(AddMemberEffect.ShowError(message))
            }
        }
    }
}
