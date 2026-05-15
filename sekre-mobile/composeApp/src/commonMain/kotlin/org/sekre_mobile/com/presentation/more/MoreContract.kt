package org.sekre_mobile.com.presentation.more

import org.sekre_mobile.com.domain.entity.Profile
import org.sekre_mobile.com.presentation.base.ViewEffect
import org.sekre_mobile.com.presentation.base.ViewEvent
import org.sekre_mobile.com.presentation.base.ViewState

data class MoreState(
    val isLoading: Boolean = false,
    val profile: Profile? = null,
    val errorMessage: String? = null,
) : ViewState

sealed interface MoreEvent : ViewEvent {
    data class SubmitProfile(val fullName: String?, val email: String?) : MoreEvent
    data class SubmitPassword(val currentPassword: String, val newPassword: String) : MoreEvent
}

sealed interface MoreEffect : ViewEffect {
    data class ShowError(val message: String) : MoreEffect
    data object PasswordChanged : MoreEffect
}
