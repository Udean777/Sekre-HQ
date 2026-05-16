package org.sekre_mobile.com.data.remote.auth

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import org.sekre_mobile.com.data.local.token.TokenManager
import org.sekre_mobile.com.data.remote.api.ApiEndpoints
import org.sekre_mobile.com.data.remote.dto.request.RefreshRequest
import org.sekre_mobile.com.data.remote.dto.response.ApiResponse
import org.sekre_mobile.com.data.remote.dto.response.TokensDto

/**
 * Serializes refresh attempts so concurrent 401s reuse the same refreshed token pair.
 */
class TokenRefresher(
    private val unauthenticatedClient: HttpClient,
    private val tokenManager: TokenManager
) {
    private val refreshMutex = Mutex()

    suspend fun refreshTokens(currentAccessToken: String?): TokensDto? {
        return refreshMutex.withLock {
            val latestAccessToken = tokenManager.getAccessToken()
            val latestRefreshToken = tokenManager.getRefreshToken()

            if (latestRefreshToken.isNullOrBlank()) {
                tokenManager.clearTokens()
                return@withLock null
            }

            if (!currentAccessToken.isNullOrBlank() && latestAccessToken != currentAccessToken) {
                return@withLock TokensDto(
                    accessToken = latestAccessToken.orEmpty(),
                    refreshToken = latestRefreshToken
                )
            }

            runCatching {
                unauthenticatedClient.post(ApiEndpoints.Auth.REFRESH_TOKEN) {
                    contentType(ContentType.Application.Json)
                    setBody(RefreshRequest(refreshToken = latestRefreshToken))
                }.body<ApiResponse<TokensDto>>()
            }.getOrNull()?.data?.also { tokens ->
                tokenManager.saveAccessToken(tokens.accessToken)
                tokenManager.saveRefreshToken(tokens.refreshToken)
            } ?: run {
                tokenManager.clearTokens()
                null
            }
        }
    }
}
