package org.sekre_mobile.com.presentation.more

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.usecase.auth.GetCurrentUserUseCase
import org.sekre_mobile.com.domain.usecase.auth.LogoutUseCase
import org.sekre_mobile.com.domain.usecase.user.ChangePasswordUseCase
import org.sekre_mobile.com.domain.usecase.user.UpdateProfileUseCase
import org.sekre_mobile.com.presentation.base.BaseViewModel

class MoreViewModel(
    private val getCurrentUserUseCase: GetCurrentUserUseCase,
    private val updateProfileUseCase: UpdateProfileUseCase,
    private val changePasswordUseCase: ChangePasswordUseCase,
    private val logoutUseCase: LogoutUseCase,
) : BaseViewModel<MoreState, MoreEvent, MoreEffect>(MoreState()) {
    private fun log(tag: String, msg: String) {
        println("[DEBUG][MoreViewModel][$tag] $msg")
    }

    override fun onEvent(event: MoreEvent) {
        log("onEvent", "event=$event")
        when (event) {
            MoreEvent.LoadProfile -> loadProfile()
            MoreEvent.Logout -> logout()
            is MoreEvent.SubmitProfile -> submitProfile(event.fullName, event.email)
            is MoreEvent.SubmitPassword -> submitPassword(event.currentPassword, event.newPassword)
        }
    }

    private fun loadProfile() = viewModelScope.launch {
        log("loadProfile", "start")
        setState { it.copy(isLoading = true, errorMessage = null) }

        val userResult = getCurrentUserUseCase()
        val user = (userResult as? Result.Success)?.data
        val userError = (userResult as? Result.Error)?.exception?.message

        val profile = user?.let {
            Profile(
                id = it.user.id,
                fullName = it.user.fullName,
                email = it.user.email,
            )
        }

        setState {
            it.copy(
                isLoading = false,
                authenticatedUser = user,
                profile = profile ?: it.profile,
                errorMessage = userError,
            )
        }

        if (userError != null) {
            log("loadProfile", "FAIL message=$userError")
            sendEffect(MoreEffect.ShowError(userError))
        } else {
            log("loadProfile", "OK userId=${user?.user?.id}")
        }
    }

    private fun submitProfile(fullName: String?, email: String?) = viewModelScope.launch {
        log("submitProfile", "start fullName=$fullName email=$email")
        setState { it.copy(isSubmittingProfile = true, errorMessage = null) }
        when (val result = updateProfileUseCase(fullName, email)) {
            is Result.Success -> {
                log("submitProfile", "OK id=${result.data.id}")
                setState { it.copy(isSubmittingProfile = false, profile = result.data) }
                sendEffect(MoreEffect.ProfileUpdated)
            }

            is Result.Error -> {
                log("submitProfile", "FAIL message=${result.exception.message}")
                handleError(
                    result.exception.message ?: "Gagal memperbarui profil",
                    profileSubmit = true,
                )
            }
        }
    }

    private fun submitPassword(currentPassword: String, newPassword: String) =
        viewModelScope.launch {
            log("submitPassword", "start")
            setState { it.copy(isSubmittingPassword = true, errorMessage = null) }
            when (val result = changePasswordUseCase(currentPassword, newPassword)) {
                is Result.Success -> {
                    log("submitPassword", "OK")
                    setState { it.copy(isSubmittingPassword = false) }
                    sendEffect(MoreEffect.PasswordChanged)
                }

                is Result.Error -> {
                    log("submitPassword", "FAIL message=${result.exception.message}")
                    handleError(
                        result.exception.message ?: "Gagal mengubah password",
                        passwordSubmit = true,
                    )
                }
            }
        }

    private fun logout() = viewModelScope.launch {
        log("logout", "start")
        logoutUseCase()
        setState { MoreState() }
        sendEffect(MoreEffect.NavigateToLogin)
    }

    private suspend fun handleError(
        message: String,
        profileSubmit: Boolean = false,
        passwordSubmit: Boolean = false,
    ) {
        log("handleError", "message=$message")
        setState {
            it.copy(
                isLoading = false,
                isSubmittingProfile = if (profileSubmit) false else it.isSubmittingProfile,
                isSubmittingPassword = if (passwordSubmit) false else it.isSubmittingPassword,
                errorMessage = message,
            )
        }
        sendEffect(MoreEffect.ShowError(message))
    }
}

private fun Profile(id: String, fullName: String, email: String) =
    org.sekre_mobile.com.domain.entity.Profile(id = id, fullName = fullName, email = email)
