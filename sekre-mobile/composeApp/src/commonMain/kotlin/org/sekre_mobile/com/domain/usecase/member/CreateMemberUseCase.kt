package org.sekre_mobile.com.domain.usecase.member

import org.sekre_mobile.com.domain.entity.Profile
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.UserRepository

class CreateMemberUseCase(
    private val userRepository: UserRepository,
) {
    suspend operator fun invoke(
        email: String,
        fullName: String,
        role: String,
        divisionIds: List<String>,
    ): Result<Profile> {
        if (email.isBlank() || !email.contains("@")) return Result.Error(Exception("Valid email is required"))
        if (fullName.isBlank() || fullName.length > 100) return Result.Error(Exception("Full name must be 1-100 characters"))
        if (role.isBlank()) return Result.Error(Exception("Role is required"))
        if (divisionIds.any { it.isBlank() }) return Result.Error(Exception("Division id cannot be blank"))
        return userRepository.createMember(email, fullName, role, divisionIds)
    }
}
