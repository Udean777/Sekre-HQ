package org.sekre_mobile.com.domain.usecase.auth

import org.sekre_mobile.com.domain.entity.AuthenticatedUser
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.AuthRepository

class RegisterUseCase(
    private val authRepository: AuthRepository,
) {
    suspend operator fun invoke(
        organizationName: String,
        subdomain: String,
        email: String,
        password: String,
        fullName: String,
    ): Result<AuthenticatedUser> {
        if (organizationName.isBlank()) return Result.Error(Exception("Organization name is required"))
        if (subdomain.isBlank()) return Result.Error(Exception("Subdomain is required"))
        if (email.isBlank()) return Result.Error(Exception("Email is required"))
        if (password.isBlank()) return Result.Error(Exception("Password is required"))
        if (fullName.isBlank()) return Result.Error(Exception("Full name is required"))

        return authRepository.register(organizationName, subdomain, email, password, fullName)
    }
}
