package org.sekre_mobile.com.domain.repository

import org.sekre_mobile.com.domain.entity.AuthenticatedUser
import org.sekre_mobile.com.domain.model.Result

/** Auth Repository Interface Domain layer - defines contract for authentication */
interface AuthRepository {
    /** Login with email and password */
    suspend fun login(email: String, password: String): Result<AuthenticatedUser>

    /** Register new organization and user */
    suspend fun register(
        organizationName: String,
        subdomain: String,
        email: String,
        password: String,
        fullName: String
    ): Result<AuthenticatedUser>

    /** Logout current user */
    suspend fun logout(): Result<Unit>

    /** Get current authenticated user */
    suspend fun getCurrentUser(): Result<AuthenticatedUser>

    /** Check if user is authenticated */
    suspend fun isAuthenticated(): Boolean
}
