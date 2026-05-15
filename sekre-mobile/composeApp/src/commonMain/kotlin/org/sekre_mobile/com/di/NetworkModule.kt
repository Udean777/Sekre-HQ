package org.sekre_mobile.com.di

import io.ktor.client.*
import org.koin.dsl.module
import org.sekre_mobile.com.data.local.token.TokenManager
import org.sekre_mobile.com.data.remote.api.KtorClientFactory

/**
 * Network Module
 * Provides HTTP clients and token manager
 */
val networkModule = module {

    // Token Manager (platform-specific, provided by platform modules)
    // single<TokenManager> { ... } // Provided by androidModule or iosModule

    // Authenticated HTTP Client
    single<HttpClient>(qualifier = org.koin.core.qualifier.named("authenticated")) {
        val tokenManager = get<TokenManager>()
        KtorClientFactory.create(
            tokenProvider = { tokenManager.getAccessToken() },
            onTokenRefresh = { token -> tokenManager.saveAccessToken(token) }
        )
    }

    // Unauthenticated HTTP Client (for login/register)
    single<HttpClient>(qualifier = org.koin.core.qualifier.named("unauthenticated")) {
        KtorClientFactory.createUnauthenticated()
    }
}
