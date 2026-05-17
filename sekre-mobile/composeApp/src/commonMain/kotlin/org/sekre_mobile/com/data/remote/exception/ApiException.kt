package org.sekre_mobile.com.data.remote.exception

/**
 * Custom exception representing structured failure from the API.
 *
 * Carries the canonical error `code` returned by the backend (e.g. `NOT_FOUND`,
 * `UNAUTHORIZED`, `INVALID_INPUT`) so the presentation layer can decide whether
 * to display a generic friendly message or a more specific one. The raw server
 * `message` is kept for diagnostics/logging only and must NOT be displayed
 * directly to end users; presentation layer should map via `ErrorMapper`.
 */
class ApiException(
    val code: String? = null,
    val httpStatus: Int? = null,
    serverMessage: String? = null,
) : Exception(serverMessage ?: "API request failed") {

    /** True when error code matches well-known auth failure (401). */
    val isUnauthorized: Boolean
        get() = httpStatus == 401 || code == CODE_UNAUTHORIZED

    /** True when error code matches well-known validation failure. */
    val isInvalidInput: Boolean
        get() = code == CODE_INVALID_INPUT

    /** True when backend explicitly signalled an internal/server error. */
    val isInternal: Boolean
        get() = code == CODE_INTERNAL || (httpStatus != null && httpStatus >= 500)

    companion object {
        const val CODE_UNAUTHORIZED = "UNAUTHORIZED"
        const val CODE_FORBIDDEN = "FORBIDDEN"
        const val CODE_NOT_FOUND = "NOT_FOUND"
        const val CODE_INVALID_INPUT = "INVALID_INPUT"
        const val CODE_CONFLICT = "CONFLICT"
        const val CODE_PRECONDITION = "PRECONDITION_FAILED"
        const val CODE_TIMEOUT = "TIMEOUT"
        const val CODE_INTERNAL = "INTERNAL"
    }
}
