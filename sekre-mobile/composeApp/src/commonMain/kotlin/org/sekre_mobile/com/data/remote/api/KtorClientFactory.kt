package org.sekre_mobile.com.data.remote.api

import io.ktor.client.*
import io.ktor.client.plugins.*
import io.ktor.client.plugins.auth.*
import io.ktor.client.plugins.auth.providers.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.plugins.logging.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

/** Ktor Client Factory Creates configured HTTP client for API communication */
object KtorClientFactory {

    /** Create HTTP client with configuration */
    fun create(
        tokenProvider: suspend () -> String?,
        onTokenRefresh: suspend (String) -> Unit
    ): HttpClient {
        return HttpClient {
            // JSON serialization
            install(ContentNegotiation) {
                json(
                    Json {
                        ignoreUnknownKeys = true
                        isLenient = true
                        encodeDefaults = true
                        prettyPrint = true
                    }
                )
            }

            // Logging
            install(Logging) {
                logger = Logger.DEFAULT
                level = LogLevel.INFO
            }

            // Timeout configuration
            install(HttpTimeout) {
                requestTimeoutMillis = ApiConfig.TIMEOUT
                connectTimeoutMillis = ApiConfig.CONNECT_TIMEOUT
                socketTimeoutMillis = ApiConfig.SOCKET_TIMEOUT
            }

            // Default request configuration
            install(DefaultRequest) {
                url(ApiConfig.BASE_URL)
                headers.append("Content-Type", "application/json")
                headers.append("Accept", "application/json")
            }

            // Authentication
            install(Auth) {
                bearer {
                    loadTokens {
                        val token = tokenProvider()
                        token?.let { BearerTokens(accessToken = it, refreshToken = "") }
                    }

                    refreshTokens {
                        val token = tokenProvider()
                        token?.let {
                            onTokenRefresh(it)
                            BearerTokens(accessToken = it, refreshToken = "")
                        }
                    }
                }
            }
        }
    }

    /** Create HTTP client without authentication Used for login/register endpoints */
    fun createUnauthenticated(): HttpClient {
        return HttpClient {
            // JSON serialization
            install(ContentNegotiation) {
                json(
                    Json {
                        ignoreUnknownKeys = true
                        isLenient = true
                        encodeDefaults = true
                        prettyPrint = true
                    }
                )
            }

            // Logging
            install(Logging) {
                logger = Logger.DEFAULT
                level = LogLevel.INFO
            }

            // Timeout configuration
            install(HttpTimeout) {
                requestTimeoutMillis = ApiConfig.TIMEOUT
                connectTimeoutMillis = ApiConfig.CONNECT_TIMEOUT
                socketTimeoutMillis = ApiConfig.SOCKET_TIMEOUT
            }

            // Default request configuration
            install(DefaultRequest) {
                url(ApiConfig.BASE_URL)
                headers.append("Content-Type", "application/json")
                headers.append("Accept", "application/json")
            }
        }
    }
}
