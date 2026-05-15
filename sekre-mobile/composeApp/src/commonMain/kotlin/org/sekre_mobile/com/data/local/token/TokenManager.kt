package org.sekre_mobile.com.data.local.token

/**
 * Token Manager Interface
 * Manages secure storage of authentication tokens
 * Platform-specific implementations for Android (EncryptedSharedPreferences) and iOS (Keychain)
 */
interface TokenManager {

    /** Save access token */
    suspend fun saveAccessToken(token: String)

    /** Get access token */
    suspend fun getAccessToken(): String?

    /** Save refresh token */
    suspend fun saveRefreshToken(token: String)

    /** Get refresh token */
    suspend fun getRefreshToken(): String?

    /** Clear all tokens (logout) */
    suspend fun clearTokens()

    /** Check if user is authenticated (has valid access token) */
    suspend fun isAuthenticated(): Boolean
}
