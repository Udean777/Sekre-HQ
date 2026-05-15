package org.sekre_mobile.com.data.remote.dto.response

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive

/** API Response wrapper from backend */
@Serializable
data class ApiErrorDetail(
    @SerialName("field") val field: String? = null,
    @SerialName("message") val message: String? = null,
)

@Serializable
data class ApiErrorObject(
    @SerialName("code") val code: String? = null,
    @SerialName("message") val message: String? = null,
    @SerialName("details") val details: List<ApiErrorDetail>? = null,
)

@Serializable
data class ApiResponse<T>(
    @SerialName("success") val success: Boolean,
    @SerialName("data") val data: T? = null,
    @SerialName("message") val message: String? = null,
    @SerialName("error") val errorRaw: JsonElement? = null,
    @SerialName("code") val code: String? = null,
    @SerialName("request_id") val requestId: String? = null,
) {
    val error: String?
        get() = resolvedErrorMessage()

    fun resolvedErrorMessage(): String? {
        val errorFromRaw = when (val e = errorRaw) {
            is JsonPrimitive -> e.content
            is JsonObject -> e["message"]?.let { (it as? JsonPrimitive)?.content }
            else -> null
        }
        return errorFromRaw ?: message
    }
}
