package org.sekre_mobile.com.domain.usecase.auth

import org.sekre_mobile.com.domain.entity.AuthenticatedUser
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.AuthRepository
import org.sekre_mobile.com.domain.util.AuthValidators

/**
 * Register Use Case.
 *
 * Validasi gabungan dijalankan di sini sebagai defense-in-depth dan
 * sebagai single source of truth aturan registrasi (sinkron dengan
 * backend `internal/infrastructure/auth/validator.go`).
 *
 * Trimming: nama organisasi, subdomain, full name, dan email di-trim
 * sebelum divalidasi dan dikirim ke API. Password sengaja tidak
 * di-trim—aturan whitespace yang strict diserahkan ke validator
 * (akan reject leading/trailing whitespace).
 */
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
        val normalizedOrgName = organizationName.trim()
        val normalizedSubdomain = subdomain.trim().lowercase()
        val normalizedEmail = email.trim()
        val normalizedFullName = fullName.trim()

        val errors = AuthValidators.validateRegister(
            organizationName = normalizedOrgName,
            subdomain = normalizedSubdomain,
            fullName = normalizedFullName,
            email = normalizedEmail,
            password = password,
        )
        if (!errors.isValid) {
            // Surface error pertama yang ditemukan; UI sudah render error
            // per-field via AuthState, ini hanya safety net untuk caller
            // yang melewati layer presentation.
            val firstMessage = errors.organizationName
                ?: errors.subdomain
                ?: errors.fullName
                ?: errors.email
                ?: errors.password
                ?: "Data registrasi tidak valid"
            return Result.Error(IllegalArgumentException(firstMessage))
        }

        return authRepository.register(
            normalizedOrgName,
            normalizedSubdomain,
            normalizedEmail,
            password,
            normalizedFullName,
        )
    }
}
