package org.sekre_mobile.com.presentation.dashboard

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.usecase.auth.GetCurrentUserUseCase
import org.sekre_mobile.com.domain.usecase.auth.LogoutUseCase
import org.sekre_mobile.com.domain.usecase.transaction.GetFinanceSummaryUseCase
import org.sekre_mobile.com.presentation.base.BaseViewModel

class DashboardViewModel(
    private val getCurrentUserUseCase: GetCurrentUserUseCase,
    private val getFinanceSummaryUseCase: GetFinanceSummaryUseCase,
    private val logoutUseCase: LogoutUseCase,
) : BaseViewModel<DashboardState, DashboardEvent, DashboardEffect>(DashboardState()) {
    private fun log(tag: String, msg: String) {
        println("[DEBUG][DashboardViewModel][$tag] $msg")
    }

    override fun onEvent(event: DashboardEvent) {
        log("onEvent", "event=$event")
        when (event) {
            DashboardEvent.Load,
            DashboardEvent.Retry,
                -> loadDashboard()

            DashboardEvent.Logout -> logout()
        }
    }

    private fun logout() {
        viewModelScope.launch {
            logoutUseCase()
            sendEffect(DashboardEffect.NavigateToLogin)
        }
    }

    private fun loadDashboard() {
        log("loadDashboard", "start")
        viewModelScope.launch {
            setState { it.copy(isLoading = true, errorMessage = null) }

            val userDeferred = async { getCurrentUserUseCase() }
            val summaryDeferred = async { getFinanceSummaryUseCase() }

            val userResult = userDeferred.await()
            val summaryResult = summaryDeferred.await()

            val user = (userResult as? Result.Success)?.data
            val summary = (summaryResult as? Result.Success)?.data
            val userError = (userResult as? Result.Error)?.exception?.message
            val summaryError = (summaryResult as? Result.Error)?.exception?.message
            val error = userError ?: summaryError

            log(
                "loadDashboard",
                "user=${user != null} summary=${summary != null} userError=$userError summaryError=$summaryError"
            )

            setState {
                it.copy(
                    isLoading = false,
                    user = user,
                    financeSummary = summary,
                    errorMessage = error,
                )
            }

            if (error != null) {
                log("loadDashboard", "FAIL emitting error effect: $error")
                sendEffect(DashboardEffect.ShowError(error))
            } else {
                log("loadDashboard", "OK done")
            }
        }
    }
}
