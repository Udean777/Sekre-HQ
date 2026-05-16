package org.sekre_mobile.com.domain.usecase.user

import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.UserRepository

class ChangePasswordUseCase(
    private val userRepository: UserRepository,
) {
    suspend operator fun invoke(currentPassword: String, newPassword: String): Result<Unit> {
        if (currentPassword.isBlank() || newPassword.isBlank()) {
            return Result.Error(Exception("Current and new password are required"))
        }
        if (newPassword.length < 8) {
            return Result.Error(Exception("New password must be at least 8 characters"))
        }
        return userRepository.changePassword(currentPassword, newPassword)
    }
}
