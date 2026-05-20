package org.sekre_mobile.com.presentation.dashboard

import org.sekre_mobile.com.domain.entity.AuthenticatedUser
import org.sekre_mobile.com.domain.entity.FinanceSummary
import org.sekre_mobile.com.presentation.base.ViewEffect
import org.sekre_mobile.com.presentation.base.ViewEvent
import org.sekre_mobile.com.presentation.base.ViewState

data class DashboardState(
    val isLoading: Boolean = false,
    val user: AuthenticatedUser? = null,
    val financeSummary: FinanceSummary? = null,
    val errorMessage: String? = null,
) : ViewState

sealed interface DashboardEvent : ViewEvent {
    data object Load : DashboardEvent
    data object Retry : DashboardEvent
    data object Logout : DashboardEvent
}

sealed interface DashboardEffect : ViewEffect {
    data class ShowError(val message: String) : DashboardEffect
    data object NavigateToLogin : DashboardEffect
}
