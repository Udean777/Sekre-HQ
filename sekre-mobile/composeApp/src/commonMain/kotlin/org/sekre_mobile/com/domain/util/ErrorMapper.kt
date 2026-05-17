package org.sekre_mobile.com.domain.util

import io.ktor.client.plugins.ClientRequestException
import io.ktor.client.plugins.HttpRequestTimeoutException
import io.ktor.client.plugins.ResponseException
import io.ktor.client.plugins.ServerResponseException
import kotlinx.coroutines.CancellationException
import kotlinx.serialization.SerializationException
import org.sekre_mobile.com.data.remote.exception.ApiException

/**
 * Maps any [Throwable] thrown by the data layer into a user-safe display message.
 *
 * Rules of engagement:
 *  - Never expose exception type names, stack traces, raw server messages, or
 *    cause chains to end users. Those leak implementation details and aid
 *    fingerprinting / exploitation.
 *  - Caller supplies a `fallback` friendly message used when the error class
 *    cannot be resolved to a more specific one (typical create/update/delete).
 *  - Authentication-related screens should pass their own fallback in
 *    Indonesian to keep tone consistent with the rest of the UI.
 *
 * Diagnostic detail (type, message, cause) is logged separately by the
 * repositories via `println`; this mapper deliberately does not surface it.
 */
object ErrorMapper {

    private const val GENERIC = "Terjadi kesalahan. Silakan coba lagi."
    private const val NETWORK = "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
    private const val TIMEOUT = "Koneksi terlalu lama. Silakan coba lagi."
    private const val UNAUTHORIZED = "Sesi Anda telah berakhir. Silakan masuk kembali."
    private const val FORBIDDEN = "Anda tidak memiliki akses untuk tindakan ini."
    private const val NOT_FOUND = "Data yang diminta tidak ditemukan."
    private const val SERVER = "Layanan sedang bermasalah. Silakan coba beberapa saat lagi."

    /**
     * Resolve user-safe error message.
     *
     * @param fallback friendly default for the operation (e.g. "Gagal memuat divisi").
     * @param throwable error captured by the repository / use case.
     * @param isAuthEntry set to `true` for login/register flows. On those
     *   screens a 401/UNAUTHORIZED means "wrong credentials", not "session
     *   expired", so we surface the operation-specific [fallback] instead of
     *   the generic session-expired copy. For protected endpoints (default
     *   `false`), 401 keeps its session-expired meaning.
     */
    fun toDisplayMessage(
        fallback: String,
        throwable: Throwable?,
        isAuthEntry: Boolean = false,
    ): String {
        if (throwable == null) return fallback
        // CancellationException is a coroutine control-flow signal, never an
        // operational failure to surface; treat as fallback to be safe.
        if (throwable is CancellationException) return fallback

        return when (throwable) {
            is ApiException -> mapApiException(throwable, fallback, isAuthEntry)
            is ClientRequestException -> mapClientStatus(throwable.response.status.value, fallback, isAuthEntry)
            is ServerResponseException -> SERVER
            is ResponseException -> mapClientStatus(throwable.response.status.value, fallback, isAuthEntry)
            is HttpRequestTimeoutException -> TIMEOUT
            is SerializationException -> GENERIC
            else -> mapByClassName(throwable, fallback)
        }
    }

    private fun mapApiException(
        e: ApiException,
        fallback: String,
        isAuthEntry: Boolean,
    ): String {
        val httpStatus = e.httpStatus
        if (httpStatus != null) {
            mapClientStatus(httpStatus, fallback, isAuthEntry).let { mapped ->
                if (mapped != fallback || httpStatus in 400..499) return mapped
            }
        }
        return when (e.code) {
            ApiException.CODE_UNAUTHORIZED -> if (isAuthEntry) fallback else UNAUTHORIZED
            ApiException.CODE_FORBIDDEN -> FORBIDDEN
            ApiException.CODE_NOT_FOUND -> NOT_FOUND
            ApiException.CODE_TIMEOUT -> TIMEOUT
            ApiException.CODE_INTERNAL -> SERVER
            // INVALID_INPUT, CONFLICT, PRECONDITION_FAILED, unknown codes:
            // use the operation-specific fallback so the user sees something
            // actionable without exposing raw server text.
            else -> fallback
        }
    }

    private fun mapClientStatus(
        status: Int,
        fallback: String,
        isAuthEntry: Boolean,
    ): String = when (status) {
        401 -> if (isAuthEntry) fallback else UNAUTHORIZED
        403 -> FORBIDDEN
        404 -> NOT_FOUND
        408 -> TIMEOUT
        in 500..599 -> SERVER
        else -> fallback
    }

    /**
     * Last-resort matcher for platform-specific IO/network exceptions whose
     * class types are not available in commonMain. Matching by simple name
     * keeps this commonMain-safe and avoids pulling platform-specific deps.
     */
    private fun mapByClassName(throwable: Throwable, fallback: String): String {
        val name = throwable::class.simpleName.orEmpty()
        return when {
            name.contains("Timeout", ignoreCase = true) -> TIMEOUT
            name.contains("UnknownHost", ignoreCase = true) -> NETWORK
            name.contains("UnresolvedAddress", ignoreCase = true) -> NETWORK
            name.contains("ConnectException", ignoreCase = true) -> NETWORK
            name.contains("SocketException", ignoreCase = true) -> NETWORK
            name.endsWith("IOException") -> NETWORK
            else -> fallback
        }
    }
}
