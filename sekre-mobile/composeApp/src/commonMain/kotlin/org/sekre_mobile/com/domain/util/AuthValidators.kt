package org.sekre_mobile.com.domain.util

import io.konform.validation.Validation
import io.konform.validation.ValidationResult
import io.konform.validation.constraints.maxLength
import io.konform.validation.constraints.minLength
import io.konform.validation.constraints.notBlank
import io.konform.validation.constraints.pattern

/**
 * Aturan validasi auth (login & register) yang dipakai bersama oleh
 * presentation layer (real-time field error) dan use case layer
 * (final guard sebelum panggil API).
 *
 * Aturan harus mirror backend (`internal/infrastructure/auth/validator.go`):
 * - email: regex RFC-ish + trim sebelum validasi
 * - password: >= 8 char, tidak boleh leading/trailing whitespace
 * - subdomain: lowercase letters, digits, hyphens
 * - organization name & full name: 2..100 char, non-blank
 *
 * Pesan error di sini sengaja Bahasa Indonesia karena ditampilkan ke
 * end user. Backend tetap English (developer-facing).
 */
object AuthValidators {

    const val MIN_PASSWORD_LENGTH = 8
    const val MAX_NAME_LENGTH = 100
    const val MIN_NAME_LENGTH = 2
    const val MAX_SUBDOMAIN_LENGTH = 63

    // Sinkron dengan emailRegex backend.
    private val emailRegex = Regex("^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$")

    // Sinkron dengan subdomainRegex backend.
    private val subdomainRegex = Regex("^[a-z0-9-]+$")

    // ---------- Single-field validators ----------

    val email: Validation<String> = Validation {
        notBlank() hint "Email wajib diisi"
        pattern(emailRegex) hint "Format email tidak valid"
    }

    val password: Validation<String> = Validation {
        notBlank() hint "Password wajib diisi"
        constrain("Password tidak boleh diawali atau diakhiri spasi") {
            it == it.trim()
        }
        minLength(MIN_PASSWORD_LENGTH) hint
                "Password minimal $MIN_PASSWORD_LENGTH karakter"
    }

    val subdomain: Validation<String> = Validation {
        notBlank() hint "Subdomain wajib diisi"
        minLength(1) hint "Subdomain wajib diisi"
        maxLength(MAX_SUBDOMAIN_LENGTH) hint
                "Subdomain maksimal $MAX_SUBDOMAIN_LENGTH karakter"
        pattern(subdomainRegex) hint
                "Subdomain hanya boleh huruf kecil, angka, dan tanda hubung"
    }

    val organizationName: Validation<String> = Validation {
        notBlank() hint "Nama organisasi wajib diisi"
        minLength(MIN_NAME_LENGTH) hint
                "Nama organisasi minimal $MIN_NAME_LENGTH karakter"
        maxLength(MAX_NAME_LENGTH) hint
                "Nama organisasi maksimal $MAX_NAME_LENGTH karakter"
    }

    val fullName: Validation<String> = Validation {
        notBlank() hint "Nama lengkap wajib diisi"
        minLength(MIN_NAME_LENGTH) hint
                "Nama lengkap minimal $MIN_NAME_LENGTH karakter"
        maxLength(MAX_NAME_LENGTH) hint
                "Nama lengkap maksimal $MAX_NAME_LENGTH karakter"
    }

    // ---------- Convenience helpers ----------

    /**
     * Jalankan [validation] terhadap [value] dan kembalikan pesan error
     * pertama, atau `null` jika valid. Cocok untuk field-level error UI.
     */
    fun firstError(validation: Validation<String>, value: String): String? {
        val result: ValidationResult<String> = validation(value)
        return result.errors.firstOrNull()?.message
    }

    /** Validasi email user-facing. Tidak melakukan trim otomatis. */
    fun validateEmail(value: String): String? = firstError(email, value)

    /** Validasi password user-facing. */
    fun validatePassword(value: String): String? = firstError(password, value)

    /** Validasi subdomain user-facing. */
    fun validateSubdomain(value: String): String? = firstError(subdomain, value)

    /** Validasi nama organisasi user-facing. */
    fun validateOrganizationName(value: String): String? =
        firstError(organizationName, value)

    /** Validasi nama lengkap user-facing. */
    fun validateFullName(value: String): String? = firstError(fullName, value)

    // ---------- Aggregated form validators ----------

    /**
     * Validasi gabungan untuk form login. Mengembalikan pasangan error
     * untuk masing-masing field; `null` berarti field tersebut valid.
     */
    data class LoginErrors(
        val email: String?,
        val password: String?,
    ) {
        val isValid: Boolean get() = email == null && password == null
    }

    fun validateLogin(email: String, password: String): LoginErrors =
        LoginErrors(
            email = validateEmail(email),
            password = validatePassword(password),
        )

    /**
     * Validasi gabungan untuk form register. Setiap field punya slot
     * error sendiri agar UI bisa menampilkan inline error per input.
     */
    data class RegisterErrors(
        val organizationName: String?,
        val subdomain: String?,
        val fullName: String?,
        val email: String?,
        val password: String?,
    ) {
        val isValid: Boolean
            get() = organizationName == null &&
                    subdomain == null &&
                    fullName == null &&
                    email == null &&
                    password == null
    }

    fun validateRegister(
        organizationName: String,
        subdomain: String,
        fullName: String,
        email: String,
        password: String,
    ): RegisterErrors = RegisterErrors(
        organizationName = validateOrganizationName(organizationName),
        subdomain = validateSubdomain(subdomain),
        fullName = validateFullName(fullName),
        email = validateEmail(email),
        password = validatePassword(password),
    )
}
