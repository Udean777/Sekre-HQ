package org.sekre_mobile.com.domain.usecase.user

import org.sekre_mobile.com.domain.entity.Profile
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.UserRepository

class UpdateProfileUseCase(
    private val userRepository: UserRepository,
) {
    suspend operator fun invoke(fullName: String?, email: String?): Result<Profile> {
        if (fullName.isNullOrBlank() && email.isNullOrBlank()) {
            return Result.Error(Exception("At least one field is required"))
        }
        return userRepository.updateProfile(fullName, email)
    }
}
