package org.sekre_mobile.com.domain.usecase.auth

import org.sekre_mobile.com.domain.entity.AuthenticatedUser
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.AuthRepository

/**
 * Get Current User Use Case
 * Application layer - orchestrates business logic
 */
class GetCurrentUserUseCase(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(): Result<AuthenticatedUser> {
        return authRepository.getCurrentUser()
    }
}
