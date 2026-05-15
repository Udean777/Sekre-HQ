package org.sekre_mobile.com.domain.usecase.auth

import org.sekre_mobile.com.domain.entity.AuthenticatedUser
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.AuthRepository

/**
 * Login Use Case
 * Application layer - orchestrates business logic
 */
class LoginUseCase(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(
        email: String,
        password: String
    ): Result<AuthenticatedUser> {
        // Validate input
        if (email.isBlank()) {
            return Result.Error(Exception("Email is required"))
        }
        if (password.isBlank()) {
            return Result.Error(Exception("Password is required"))
        }

        // Login via repository
        return authRepository.login(email, password)
    }
}
