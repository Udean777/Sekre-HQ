package org.sekre_mobile.com.presentation.auth

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.usecase.auth.GetCurrentUserUseCase
import org.sekre_mobile.com.domain.usecase.auth.LoginUseCase
import org.sekre_mobile.com.domain.usecase.auth.RegisterUseCase
import org.sekre_mobile.com.domain.util.AuthValidators
import org.sekre_mobile.com.domain.util.ErrorMapper
import org.sekre_mobile.com.presentation.base.BaseViewModel

class AuthViewModel(
    private val loginUseCase: LoginUseCase,
    private val registerUseCase: RegisterUseCase,
    private val getCurrentUserUseCase: GetCurrentUserUseCase,
) : BaseViewModel<AuthState, AuthEvent, AuthEffect>(AuthState()) {

    override fun onEvent(event: AuthEvent) {
        when (event) {
            AuthEvent.Bootstrap -> bootstrap()
            is AuthEvent.EmailChanged -> setState {
                it.copy(
                    email = event.value,
                    emailTouched = true,
                    emailError = AuthValidators.validateEmail(event.value),
                    errorMessage = null,
                )
            }

            is AuthEvent.PasswordChanged -> setState {
                it.copy(
                    password = event.value,
                    passwordTouched = true,
                    passwordError = AuthValidators.validatePassword(event.value),
                    errorMessage = null,
                )
            }

            is AuthEvent.OrganizationNameChanged -> setState {
                it.copy(
                    organizationName = event.value,
                    organizationNameTouched = true,
                    organizationNameError =
                        AuthValidators.validateOrganizationName(event.value),
                    errorMessage = null,
                )
            }

            is AuthEvent.SubdomainChanged -> setState {
                it.copy(
                    subdomain = event.value,
                    subdomainTouched = true,
                    subdomainError = AuthValidators.validateSubdomain(event.value),
                    errorMessage = null,
                )
            }

            is AuthEvent.FullNameChanged -> setState {
                it.copy(
                    fullName = event.value,
                    fullNameTouched = true,
                    fullNameError = AuthValidators.validateFullName(event.value),
                    errorMessage = null,
                )
            }

            AuthEvent.SubmitLogin -> submitLogin()
            AuthEvent.SubmitRegister -> submitRegister()
            AuthEvent.OpenLogin -> openLogin()

            AuthEvent.OpenRegister -> openRegister()

            AuthEvent.SignedOut -> signedOut()
        }
    }

    private fun signedOut() {
        setState {
            AuthState(
                isBootstrapping = false,
                isLoading = false,
                isAuthenticated = false,
                currentRoute = AuthRoutes.LOGIN,
            )
        }
        viewModelScope.launch {
            sendEffect(AuthEffect.OpenLogin)
        }
    }

    private fun openLogin() {
        // Pindah ke form login: bersihkan error dan touched flag yang
        // hanya relevan untuk register supaya inline error tidak ikut
        // terbawa lintas form.
        setState {
            it.copy(
                currentRoute = AuthRoutes.LOGIN,
                errorMessage = null,
                organizationNameError = null,
                subdomainError = null,
                fullNameError = null,
                organizationNameTouched = false,
                subdomainTouched = false,
                fullNameTouched = false,
            )
        }
        viewModelScope.launch {
            sendEffect(AuthEffect.OpenLogin)
        }
    }

    private fun openRegister() {
        setState {
            it.copy(
                currentRoute = AuthRoutes.REGISTER,
                errorMessage = null,
            )
        }
        viewModelScope.launch {
            sendEffect(AuthEffect.OpenRegister)
        }
    }

    private fun bootstrap() {
        viewModelScope.launch {
            setState { it.copy(isBootstrapping = true, isLoading = true, errorMessage = null) }
            when (val result = getCurrentUserUseCase()) {
                is Result.Success -> {
                    setState {
                        it.copy(
                            isBootstrapping = false,
                            isLoading = false,
                            isAuthenticated = true,
                            currentUser = result.data
                        )
                    }
                }

                is Result.Error -> {
                    setState {
                        it.copy(
                            isBootstrapping = false,
                            isLoading = false,
                            isAuthenticated = false,
                        )
                    }
                }
            }
        }
    }

    private fun submitLogin() {
        val current = state.value

        // Final guard: re-validate semua field login dan tandai touched.
        // Jika ada field invalid, abort sebelum panggil use case dan
        // surface inline error di UI.
        val errors = AuthValidators.validateLogin(current.email, current.password)
        if (!errors.isValid) {
            setState {
                it.copy(
                    emailTouched = true,
                    passwordTouched = true,
                    emailError = errors.email,
                    passwordError = errors.password,
                )
            }
            return
        }

        viewModelScope.launch {
            setState { it.copy(isLoading = true, errorMessage = null) }
            when (val result = loginUseCase(current.email.trim(), current.password)) {
                is Result.Success -> {
                    setState {
                        it.copy(
                            isLoading = false,
                            isAuthenticated = true,
                            currentUser = result.data
                        )
                    }
                    sendEffect(AuthEffect.OpenMain)
                }

                    is Result.Error -> {
                        val msg = ErrorMapper.toDisplayMessage(
                            "Email atau password salah. Silakan coba lagi.",
                            result.exception,
                            isAuthEntry = true,
                        )
                        setState { it.copy(isLoading = false, errorMessage = msg) }
                        sendEffect(AuthEffect.ShowError(msg))
                    }
            }
        }
    }

    private fun submitRegister() {
        val current = state.value

        // Final guard: re-validate semua field register sebelum panggil API.
        val errors = AuthValidators.validateRegister(
            organizationName = current.organizationName,
            subdomain = current.subdomain,
            fullName = current.fullName,
            email = current.email,
            password = current.password,
        )
        if (!errors.isValid) {
            setState {
                it.copy(
                    organizationNameTouched = true,
                    subdomainTouched = true,
                    fullNameTouched = true,
                    emailTouched = true,
                    passwordTouched = true,
                    organizationNameError = errors.organizationName,
                    subdomainError = errors.subdomain,
                    fullNameError = errors.fullName,
                    emailError = errors.email,
                    passwordError = errors.password,
                )
            }
            return
        }

        viewModelScope.launch {
            setState { it.copy(isLoading = true, errorMessage = null) }
            when (
                val result = registerUseCase(
                    organizationName = current.organizationName.trim(),
                    subdomain = current.subdomain.trim(),
                    email = current.email.trim(),
                    password = current.password,
                    fullName = current.fullName.trim(),
                )
            ) {
                is Result.Success -> {
                    setState {
                        it.copy(
                            isLoading = false,
                            isAuthenticated = true,
                            currentUser = result.data
                        )
                    }
                    sendEffect(AuthEffect.OpenMain)
                }

                    is Result.Error -> {
                        val msg = ErrorMapper.toDisplayMessage(
                            "Pendaftaran gagal. Silakan coba lagi atau hubungi admin.",
                            result.exception,
                            isAuthEntry = true,
                        )
                        setState { it.copy(isLoading = false, errorMessage = msg) }
                    sendEffect(AuthEffect.ShowError(msg))
                }
            }
        }
    }
}
