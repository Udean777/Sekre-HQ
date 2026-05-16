package org.sekre_mobile.com.presentation.division

import org.sekre_mobile.com.domain.entity.Division
import org.sekre_mobile.com.domain.entity.Profile
import org.sekre_mobile.com.presentation.base.ViewEffect
import org.sekre_mobile.com.presentation.base.ViewEvent
import org.sekre_mobile.com.presentation.base.ViewState

data class DivisionState(
    val isLoading: Boolean = false,
    val divisions: List<Division> = emptyList(),
    val selectedDivision: Division? = null,
    val members: List<Profile> = emptyList(),
    val errorMessage: String? = null,
) : ViewState

sealed interface DivisionEvent : ViewEvent {
    data object LoadDivisions : DivisionEvent
    data object LoadMembers : DivisionEvent
    data class OpenDivisionDetail(val id: String) : DivisionEvent
}

sealed interface DivisionEffect : ViewEffect {
    data class ShowError(val message: String) : DivisionEffect
}
