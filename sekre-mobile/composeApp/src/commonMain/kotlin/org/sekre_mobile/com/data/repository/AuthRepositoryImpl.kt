package org.sekre_mobile.com.data.repository

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*
import org.sekre_mobile.com.data.local.token.TokenManager
import org.sekre_mobile.com.data.mapper.AuthMapper
import org.sekre_mobile.com.data.mapper.AuthMapper.toDomain
import org.sekre_mobile.com.data.remote.api.ApiEndpoints
import org.sekre_mobile.com.data.remote.dto.request.LoginRequest
import org.sekre_mobile.com.data.remote.dto.request.RegisterRequest
import org.sekre_mobile.com.data.remote.dto.response.ApiResponse
import org.sekre_mobile.com.data.remote.dto.response.AuthResponseDto
import org.sekre_mobile.com.domain.entity.AuthenticatedUser
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.AuthRepository

/**
 * Auth Repository Implementation
 * Data layer - implements authentication data access using Ktor
 */
class AuthRepositoryImpl(
    private val httpClient: HttpClient,
    private val unauthenticatedClient: HttpClient,
    private val tokenManager: TokenManager
) : AuthRepository {

    private fun debugLog(tag: String, message: String) { /* debug disabled */ }

    private fun debugError(tag: String, e: Exception) {
        debugLog(tag, "type=${e::class.simpleName} message=${e.message}")
        e.cause?.let { cause ->
            debugLog(tag, "causeType=${cause::class.simpleName} causeMessage=${cause.message}")
        }
        debugLog(tag, "stacktrace=${e.stackTraceToString()}")
    }

    override suspend fun login(email: String, password: String): Result<AuthenticatedUser> {
        debugLog("login", "request start email=$email")
        return try {
            val response = unauthenticatedClient.post(ApiEndpoints.Auth.LOGIN) {
                contentType(ContentType.Application.Json)
                setBody(LoginRequest(email = email, password = password))
            }.body<ApiResponse<AuthResponseDto>>()

            if (response.success && response.data != null) {
                if (response.data.tokens == null) {
                    debugLog("login", "response invalid: tokens missing")
                    return Result.Error(Exception("Login response missing tokens"))
                }
                debugLog("login", "response success userId=${response.data.user.id}")
                // Save tokens
                tokenManager.saveAccessToken(response.data.tokens.accessToken)
                tokenManager.saveRefreshToken(response.data.tokens.refreshToken)

                // Convert to domain entity
                Result.Success(response.data.toDomain())
            } else {
                debugLog("login", "response fail error=${response.error} message=${response.message}")
                Result.Error(Exception(response.error ?: "Login failed"))
            }
        } catch (e: Exception) {
            debugError("login", e)
            Result.Error(e)
        }
    }

    override suspend fun register(
        organizationName: String,
        subdomain: String,
        email: String,
        password: String,
        fullName: String
    ): Result<AuthenticatedUser> {
        debugLog("register", "request start email=$email subdomain=$subdomain org=$organizationName")
        return try {
            val response = unauthenticatedClient.post(ApiEndpoints.Auth.REGISTER) {
                contentType(ContentType.Application.Json)
                setBody(
                    RegisterRequest(
                        organizationName = organizationName,
                        subdomain = subdomain,
                        email = email,
                        password = password,
                        fullName = fullName
                    )
                )
            }.body<ApiResponse<AuthResponseDto>>()

            if (response.success && response.data != null) {
                if (response.data.tokens == null) {
                    debugLog("register", "response invalid: tokens missing")
                    return Result.Error(Exception("Register response missing tokens"))
                }
                debugLog("register", "response success userId=${response.data.user.id}")
                // Save tokens
                tokenManager.saveAccessToken(response.data.tokens.accessToken)
                tokenManager.saveRefreshToken(response.data.tokens.refreshToken)

                // Convert to domain entity
                Result.Success(response.data.toDomain())
            } else {
                debugLog("register", "response fail error=${response.error} message=${response.message}")
                Result.Error(Exception(response.error ?: "Registration failed"))
            }
        } catch (e: Exception) {
            debugError("register", e)
            Result.Error(e)
        }
    }

    override suspend fun logout(): Result<Unit> {
        return try {
            // Call logout endpoint
            val response = httpClient.post(ApiEndpoints.Auth.LOGOUT).body<ApiResponse<Unit>>()

            // Clear tokens regardless of API response
            tokenManager.clearTokens()

            if (response.success) {
                Result.Success(Unit)
            } else {
                Result.Error(Exception(response.error ?: "Logout failed"))
            }
        } catch (e: Exception) {
            // Clear tokens even if API call fails
            tokenManager.clearTokens()
            Result.Error(e)
        }
    }

    override suspend fun getCurrentUser(): Result<AuthenticatedUser> {
        debugLog("me", "request start")
        return try {
            val response = httpClient.get(ApiEndpoints.Auth.ME).body<ApiResponse<AuthResponseDto>>()

            if (response.success && response.data != null) {
                debugLog("me", "response success userId=${response.data.user.id}")
                Result.Success(response.data.toDomain())
            } else {
                debugLog("me", "response fail error=${response.error} message=${response.message}")
                Result.Error(Exception(response.error ?: "Failed to get current user"))
            }
        } catch (e: Exception) {
            debugError("me", e)
            Result.Error(e)
        }
    }

    override suspend fun isAuthenticated(): Boolean {
        return tokenManager.isAuthenticated()
    }
}
