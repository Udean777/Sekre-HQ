package org.sekre_mobile.com.presentation.dashboard

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.usecase.auth.GetCurrentUserUseCase
import org.sekre_mobile.com.domain.usecase.transaction.GetFinanceSummaryUseCase
import org.sekre_mobile.com.presentation.base.BaseViewModel

class DashboardViewModel(
    private val getCurrentUserUseCase: GetCurrentUserUseCase,
    private val getFinanceSummaryUseCase: GetFinanceSummaryUseCase,
) : BaseViewModel<DashboardState, DashboardEvent, DashboardEffect>(DashboardState()) {
    override fun onEvent(event: DashboardEvent) {
        when (event) {
            DashboardEvent.Load,
            DashboardEvent.Retry,
                -> loadDashboard()
        }
    }

    private fun loadDashboard() {
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

            setState {
                it.copy(
                    isLoading = false,
                    user = user,
                    financeSummary = summary,
                    errorMessage = error,
                )
            }

            if (error != null) {
                sendEffect(DashboardEffect.ShowError(error))
            }
        }
    }
}
