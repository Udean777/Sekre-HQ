package org.sekre_mobile.com.presentation.auth

import org.sekre_mobile.com.domain.entity.AuthenticatedUser
import org.sekre_mobile.com.presentation.base.ViewEffect
import org.sekre_mobile.com.presentation.base.ViewEvent
import org.sekre_mobile.com.presentation.base.ViewState

data class AuthState(
    val isBootstrapping: Boolean = true,
    val isLoading: Boolean = false,
    val isAuthenticated: Boolean = false,
    val currentRoute: String = AuthRoutes.LOGIN,
    val email: String = "",
    val password: String = "",
    val organizationName: String = "",
    val subdomain: String = "",
    val fullName: String = "",
    val errorMessage: String? = null,
    val currentUser: AuthenticatedUser? = null,
) : ViewState

sealed interface AuthEvent : ViewEvent {
    data object Bootstrap : AuthEvent
    data class EmailChanged(val value: String) : AuthEvent
    data class PasswordChanged(val value: String) : AuthEvent
    data class OrganizationNameChanged(val value: String) : AuthEvent
    data class SubdomainChanged(val value: String) : AuthEvent
    data class FullNameChanged(val value: String) : AuthEvent
    data object SubmitLogin : AuthEvent
    data object SubmitRegister : AuthEvent
    data object OpenLogin : AuthEvent
    data object OpenRegister : AuthEvent
    /**
     * Fired by other features (e.g. MoreViewModel) after they have already
     * cleared tokens and finished their own logout work. This resets the
     * Auth state and navigates back to the login screen.
     */
    data object SignedOut : AuthEvent
}

sealed interface AuthEffect : ViewEffect {
    data class ShowError(val message: String) : AuthEffect
    data object OpenLogin : AuthEffect
    data object OpenRegister : AuthEffect
    data object OpenMain : AuthEffect
}

object AuthRoutes {
    const val LOGIN = "login"
    const val REGISTER = "register"
}
