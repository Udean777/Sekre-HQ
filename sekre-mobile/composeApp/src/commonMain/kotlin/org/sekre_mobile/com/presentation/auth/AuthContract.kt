package org.sekre_mobile.com.presentation.auth

import org.sekre_mobile.com.domain.entity.AuthenticatedUser
import org.sekre_mobile.com.domain.util.AuthValidators
import org.sekre_mobile.com.presentation.base.ViewEffect
import org.sekre_mobile.com.presentation.base.ViewEvent
import org.sekre_mobile.com.presentation.base.ViewState

/**
 * State untuk Auth (login & register).
 *
 * Field error per input bersifat opsional (`String?`); `null` berarti
 * tidak ada error untuk field tersebut. Error hanya ditampilkan setelah
 * field disentuh (`*Touched = true`) supaya inline error tidak muncul
 * pada saat form pertama dirender.
 *
 * `canSubmit*` di-compute setiap render dari validator sehingga UI bisa
 * mengaktifkan / menonaktifkan tombol submit secara real-time.
 */
data class AuthState(
    val isBootstrapping: Boolean = true,
    val isLoading: Boolean = false,
    val isAuthenticated: Boolean = false,
    val currentRoute: String = AuthRoutes.LOGIN,

    // Form values
    val email: String = "",
    val password: String = "",
    val organizationName: String = "",
    val subdomain: String = "",
    val fullName: String = "",

    // Field-level error messages (Bahasa Indonesia, user-facing)
    val emailError: String? = null,
    val passwordError: String? = null,
    val organizationNameError: String? = null,
    val subdomainError: String? = null,
    val fullNameError: String? = null,

    // Touched flags: error hanya boleh tampil ketika field sudah disentuh
    // user (mengetik atau coba submit). Mencegah inline error muncul saat
    // form baru dibuka.
    val emailTouched: Boolean = false,
    val passwordTouched: Boolean = false,
    val organizationNameTouched: Boolean = false,
    val subdomainTouched: Boolean = false,
    val fullNameTouched: Boolean = false,

    // Global error (network / API failure)
    val errorMessage: String? = null,

    val currentUser: AuthenticatedUser? = null,
) : ViewState {

    /**
     * Apakah form login lolos validasi dan siap di-submit. Digunakan UI
     * untuk meng-enable / disable tombol "Masuk".
     */
    val canSubmitLogin: Boolean
        get() = !isLoading && AuthValidators
            .validateLogin(email, password)
            .isValid

    /**
     * Apakah form register lolos validasi dan siap di-submit. Digunakan
     * UI untuk meng-enable / disable tombol "Daftar".
     */
    val canSubmitRegister: Boolean
        get() = !isLoading && AuthValidators
            .validateRegister(
                organizationName = organizationName,
                subdomain = subdomain,
                fullName = fullName,
                email = email,
                password = password,
            )
            .isValid
}

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
     * Fired by other features (e.g. MoreViewModel) after they
     * cleared tokens and finished their own logout work. It resets
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
