package org.sekre_mobile.com.presentation.auth

import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.launch
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.usecase.auth.GetCurrentUserUseCase
import org.sekre_mobile.com.domain.usecase.auth.LoginUseCase
import org.sekre_mobile.com.domain.usecase.auth.RegisterUseCase
import org.sekre_mobile.com.presentation.base.BaseViewModel

class AuthViewModel(
    private val loginUseCase: LoginUseCase,
    private val registerUseCase: RegisterUseCase,
    private val getCurrentUserUseCase: GetCurrentUserUseCase,
) : BaseViewModel<AuthState, AuthEvent, AuthEffect>(AuthState()) {

    private fun debugErrorMessage(prefix: String, throwable: Throwable): String {
        val cause = throwable.cause?.let { " | cause=${it::class.simpleName}: ${it.message}" } ?: ""
        return "$prefix | type=${throwable::class.simpleName} | message=${throwable.message}$cause"
    }

    override fun onEvent(event: AuthEvent) {
        when (event) {
            AuthEvent.Bootstrap -> bootstrap()
            is AuthEvent.EmailChanged -> setState {
                it.copy(
                    email = event.value,
                    errorMessage = null
                )
            }

            is AuthEvent.PasswordChanged -> setState {
                it.copy(
                    password = event.value,
                    errorMessage = null
                )
            }

            is AuthEvent.OrganizationNameChanged -> setState {
                it.copy(
                    organizationName = event.value,
                    errorMessage = null
                )
            }

            is AuthEvent.SubdomainChanged -> setState {
                it.copy(
                    subdomain = event.value,
                    errorMessage = null
                )
            }

            is AuthEvent.FullNameChanged -> setState {
                it.copy(
                    fullName = event.value,
                    errorMessage = null
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
        setState {
            it.copy(
                currentRoute = AuthRoutes.LOGIN,
                errorMessage = null,
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
                    val msg = debugErrorMessage("Login failed", result.exception)
                    setState { it.copy(isLoading = false, errorMessage = msg) }
                    sendEffect(AuthEffect.ShowError(msg))
                }
            }
        }
    }

    private fun submitRegister() {
        val current = state.value
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
                    val msg = debugErrorMessage("Registration failed", result.exception)
                    setState { it.copy(isLoading = false, errorMessage = msg) }
                    sendEffect(AuthEffect.ShowError(msg))
                }
            }
        }
    }
}
