package org.sekre_mobile.com.domain.usecase.auth

import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.AuthRepository

/**
 * Logout Use Case
 * Application layer - orchestrates business logic
 */
class LogoutUseCase(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(): Result<Unit> {
        return authRepository.logout()
    }
}
