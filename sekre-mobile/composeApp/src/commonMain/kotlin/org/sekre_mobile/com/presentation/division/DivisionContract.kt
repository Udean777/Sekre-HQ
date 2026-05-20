package org.sekre_mobile.com.presentation.division

import org.sekre_mobile.com.domain.entity.Division
import org.sekre_mobile.com.domain.entity.DivisionMemberUser
import org.sekre_mobile.com.presentation.base.ViewEffect
import org.sekre_mobile.com.presentation.base.ViewEvent
import org.sekre_mobile.com.presentation.base.ViewState

data class DivisionState(
    val isLoading: Boolean = false,
    val divisions: List<Division> = emptyList(),
    val selectedDivision: Division? = null,
    val divisionMembers: List<DivisionMemberUser> = emptyList(),
    val isLoadingDetailMembers: Boolean = false,
    val isSubmitting: Boolean = false,
    val isDeleting: Boolean = false,
    val errorMessage: String? = null,
) : ViewState

sealed interface DivisionEvent : ViewEvent {
    data object LoadDivisions : DivisionEvent
    data class OpenDivisionDetail(val id: String) : DivisionEvent
    data class LoadDivisionMembers(val divisionId: String) : DivisionEvent
    data class SubmitCreate(val name: String) : DivisionEvent
    data class SubmitEdit(val id: String, val name: String) : DivisionEvent
    data class SubmitDelete(val id: String) : DivisionEvent
}

sealed interface DivisionEffect : ViewEffect {
    data class ShowError(val message: String) : DivisionEffect
    data object CreatedSuccessfully : DivisionEffect
    data object UpdatedSuccessfully : DivisionEffect
    data object DeletedSuccessfully : DivisionEffect
}
