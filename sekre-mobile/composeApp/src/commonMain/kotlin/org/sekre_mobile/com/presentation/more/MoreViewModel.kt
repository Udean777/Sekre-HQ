package org.sekre_mobile.com.presentation.more

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.usecase.user.ChangePasswordUseCase
import org.sekre_mobile.com.domain.usecase.user.UpdateProfileUseCase
import org.sekre_mobile.com.presentation.base.BaseViewModel

class MoreViewModel(
    private val updateProfileUseCase: UpdateProfileUseCase,
    private val changePasswordUseCase: ChangePasswordUseCase,
) : BaseViewModel<MoreState, MoreEvent, MoreEffect>(MoreState()) {
    override fun onEvent(event: MoreEvent) {
        when (event) {
            is MoreEvent.SubmitProfile -> submitProfile(event.fullName, event.email)
            is MoreEvent.SubmitPassword -> submitPassword(event.currentPassword, event.newPassword)
        }
    }

    private fun submitProfile(fullName: String?, email: String?) = viewModelScope.launch {
        setState { it.copy(isLoading = true, errorMessage = null) }
        when (val result = updateProfileUseCase(fullName, email)) {
            is Result.Success -> setState { it.copy(isLoading = false, profile = result.data) }
            is Result.Error -> handleError(result.exception.message ?: "Failed to update profile")
        }
    }

    private fun submitPassword(currentPassword: String, newPassword: String) =
        viewModelScope.launch {
            setState { it.copy(isLoading = true, errorMessage = null) }
            when (val result = changePasswordUseCase(currentPassword, newPassword)) {
                is Result.Success -> {
                    setState { it.copy(isLoading = false) }
                    sendEffect(MoreEffect.PasswordChanged)
                }

                is Result.Error -> handleError(
                    result.exception.message ?: "Failed to change password"
                )
            }
        }

    private fun handleError(message: String) = viewModelScope.launch {
        setState { it.copy(isLoading = false, errorMessage = message) }
        sendEffect(MoreEffect.ShowError(message))
    }
}
