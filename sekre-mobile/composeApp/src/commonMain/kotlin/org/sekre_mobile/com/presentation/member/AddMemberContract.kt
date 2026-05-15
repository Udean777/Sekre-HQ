package org.sekre_mobile.com.presentation.member

import org.sekre_mobile.com.domain.entity.Division
import org.sekre_mobile.com.presentation.base.ViewEffect
import org.sekre_mobile.com.presentation.base.ViewEvent
import org.sekre_mobile.com.presentation.base.ViewState

data class AddMemberState(
    val isLoading: Boolean = false,
    val fullName: String = "",
    val email: String = "",
    val role: String = "MEMBER",
    val availableDivisions: List<Division> = emptyList(),
    val selectedDivisionIds: Set<String> = emptySet(),
    val errorMessage: String? = null,
) : ViewState

sealed interface AddMemberEvent : ViewEvent {
    data class SetFullName(val value: String) : AddMemberEvent
    data class SetEmail(val value: String) : AddMemberEvent
    data class SetRole(val value: String) : AddMemberEvent
    data class ToggleDivision(val id: String) : AddMemberEvent
    data object Submit : AddMemberEvent
}

sealed interface AddMemberEffect : ViewEffect {
    data class ShowError(val message: String) : AddMemberEffect
    data object CreatedSuccessfully : AddMemberEffect
}
