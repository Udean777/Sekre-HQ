package org.sekre_mobile.com.data.remote.api

/** API Configuration Infrastructure layer - centralized API configuration */
object ApiConfig {
    /** Base URL for API requests TODO: Update this with your actual backend URL */
    const val BASE_URL = "http://localhost:8080/api/v1"

    /** Request timeout in milliseconds */
    const val TIMEOUT = 30_000L // 30 seconds

    /** Connect timeout in milliseconds */
    const val CONNECT_TIMEOUT = 15_000L // 15 seconds

    /** Socket timeout in milliseconds */
    const val SOCKET_TIMEOUT = 30_000L // 30 seconds
}
