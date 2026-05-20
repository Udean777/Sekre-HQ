package org.sekre_mobile.com.presentation.member

import org.sekre_mobile.com.domain.entity.Division
import org.sekre_mobile.com.domain.entity.Profile
import org.sekre_mobile.com.presentation.base.ViewEffect
import org.sekre_mobile.com.presentation.base.ViewEvent
import org.sekre_mobile.com.presentation.base.ViewState

data class MemberState(
    val isLoading: Boolean = false,
    val members: List<Profile> = emptyList(),
    /** Full org-wide member list cached for "Semua" filter without re-fetching. */
    val allMembers: List<Profile> = emptyList(),
    val divisions: List<Division> = emptyList(),
    val selectedDivisionFilter: String? = null,
    val errorMessage: String? = null,
) : ViewState

sealed interface MemberEvent : ViewEvent {
    data object Load : MemberEvent
    data class FilterByDivision(val divisionId: String?) : MemberEvent
}

sealed interface MemberEffect : ViewEffect {
    data class ShowError(val message: String) : MemberEffect
}
