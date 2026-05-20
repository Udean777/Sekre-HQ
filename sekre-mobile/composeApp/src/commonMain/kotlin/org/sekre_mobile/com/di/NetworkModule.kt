package org.sekre_mobile.com.di

import io.ktor.client.*
import org.koin.dsl.module
import org.sekre_mobile.com.data.local.token.TokenManager
import org.sekre_mobile.com.data.remote.api.KtorClientFactory
import org.sekre_mobile.com.data.remote.auth.TokenRefresher

/**
 * Network Module
 * Provides HTTP clients and token manager
 */
val networkModule = module {

    // Token Manager (platform-specific, provided by platform modules)
    // single<TokenManager> { ... } // Provided by androidModule or iosModule

    single {
        TokenRefresher(
            unauthenticatedClient = get(org.koin.core.qualifier.named("unauthenticated")),
            tokenManager = get()
        )
    }

    // Authenticated HTTP Client
    single<HttpClient>(qualifier = org.koin.core.qualifier.named("authenticated")) {
        val tokenManager = get<TokenManager>()
        val tokenRefresher = get<TokenRefresher>()
        KtorClientFactory.create(
            tokenProvider = {
                val accessToken = tokenManager.getAccessToken()
                val refreshToken = tokenManager.getRefreshToken()

                if (accessToken.isNullOrBlank() || refreshToken.isNullOrBlank()) {
                    null
                } else {
                    io.ktor.client.plugins.auth.providers.BearerTokens(
                        accessToken = accessToken,
                        refreshToken = refreshToken
                    )
                }
            },
            onTokenRefresh = { oldTokens ->
                tokenRefresher.refreshTokens(oldTokens?.accessToken)?.let { tokens ->
                    io.ktor.client.plugins.auth.providers.BearerTokens(
                        accessToken = tokens.accessToken,
                        refreshToken = tokens.refreshToken
                    )
                }
            }
        )
    }

    // Unauthenticated HTTP Client (for login/register)
    single<HttpClient>(qualifier = org.koin.core.qualifier.named("unauthenticated")) {
        KtorClientFactory.createUnauthenticated()
    }
}
