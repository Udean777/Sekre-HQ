package org.sekre_mobile.com.domain.usecase.auth

import org.sekre_mobile.com.domain.entity.AuthenticatedUser
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.AuthRepository
import org.sekre_mobile.com.domain.util.AuthValidators

/**
 * Login Use Case
 * Application layer that orchestrates business logic.
 *
 * Validasi input dilakukan ulang di sini sebagai defense-in-depth:
 * use case bisa saja dipanggil dari context lain (test, future
 * integration) yang melewati layer UI. Dengan begitu aturan validasi
 * tetap konsisten di mana pun call site-nya.
 */
class LoginUseCase(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(
        email: String,
        password: String
    ): Result<AuthenticatedUser> {
        // Trim email di sini supaya semua call site dapat perilaku sama.
        // Password tidak di-trim: leading/trailing whitespace dianggap
        // bagian dari password. Aturan reject whitespace hanya berlaku
        // saat register (mirror backend `ValidatePassword`).
        val normalizedEmail = email.trim()

        AuthValidators.validateEmail(normalizedEmail)?.let { msg ->
            return Result.Error(IllegalArgumentException(msg))
        }
        if (password.isEmpty()) {
            return Result.Error(IllegalArgumentException("Password wajib diisi"))
        }

        return authRepository.login(normalizedEmail, password)
    }
}
