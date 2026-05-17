package org.sekre_mobile.com.data.repository

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.post
import io.ktor.client.request.get
import io.ktor.client.request.setBody
import io.ktor.client.request.patch
import io.ktor.http.ContentType
import io.ktor.http.contentType
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import org.sekre_mobile.com.data.remote.api.ApiEndpoints
import org.sekre_mobile.com.data.remote.dto.request.ChangePasswordRequest
import org.sekre_mobile.com.data.remote.dto.request.CreateMemberRequest
import org.sekre_mobile.com.data.remote.dto.request.UpdateProfileRequest
import org.sekre_mobile.com.data.remote.dto.response.ApiResponse
import org.sekre_mobile.com.data.remote.exception.ApiException
import org.sekre_mobile.com.domain.entity.Profile
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.UserRepository

class UserRepositoryImpl(
    private val httpClient: HttpClient,
) : UserRepository {
    private fun log(tag: String, msg: String) {
        println("[DEBUG][UserRepository][$tag] $msg")
    }
    private fun logErr(tag: String, e: Exception) {
        println("[DEBUG][UserRepository][$tag][ERROR] type=${e::class.simpleName} message=${e.message}")
        e.cause?.let {
            println("[DEBUG][UserRepository][$tag][ERROR] causeType=${it::class.simpleName} causeMessage=${it.message}")
        }
        println("[DEBUG][UserRepository][$tag][STACKTRACE]\n${e.stackTraceToString()}")
    }

    private fun apiFailure(response: ApiResponse<*>): ApiException = ApiException(
        code = response.code,
        httpStatus = null,
        serverMessage = response.error ?: response.message,
    )

    override suspend fun updateProfile(fullName: String?, email: String?): Result<Profile> {
        log("updateProfile", "start fullName=$fullName email=$email")
        return try {
            val response = httpClient.patch(ApiEndpoints.Users.PROFILE) {
                contentType(ContentType.Application.Json)
                setBody(UpdateProfileRequest(fullName = fullName, email = email))
            }.body<ApiResponse<ProfileDto>>()

            log("updateProfile", "response success=${response.success} hasData=${response.data != null} error=${response.error} message=${response.message}")
            if (response.success && response.data != null) {
                log("updateProfile", "OK id=${response.data.id}")
                Result.Success(response.data.toDomain())
            } else {
                log("updateProfile", "FAIL error=${response.error}")
                Result.Error(apiFailure(response))
            }
        } catch (e: Exception) {
            logErr("updateProfile", e)
            Result.Error(e)
        }
    }

    override suspend fun changePassword(currentPassword: String, newPassword: String): Result<Unit> {
        log("changePassword", "start")
        return try {
            val response = httpClient.post(ApiEndpoints.Users.UPDATE_PASSWORD) {
                contentType(ContentType.Application.Json)
                setBody(ChangePasswordRequest(currentPassword, newPassword))
            }.body<ApiResponse<Unit>>()
            log("changePassword", "response success=${response.success} error=${response.error}")
            if (response.success) Result.Success(Unit)
            else Result.Error(apiFailure(response))
        } catch (e: Exception) {
            logErr("changePassword", e)
            Result.Error(e)
        }
    }

    override suspend fun listMembers(): Result<List<Profile>> {
        log("listMembers", "start")
        return try {
            val response = httpClient.get(ApiEndpoints.Members.LIST).body<ApiResponse<MemberListPayloadDto>>()
            log("listMembers", "response success=${response.success} hasData=${response.data != null} count=${response.data?.data?.size} error=${response.error}")
            if (response.success && response.data != null) {
                log("listMembers", "OK count=${response.data.data.size}")
                Result.Success(response.data.data.map { it.toDomain() })
            } else {
                log("listMembers", "FAIL error=${response.error}")
                Result.Error(apiFailure(response))
            }
        } catch (e: Exception) {
            logErr("listMembers", e)
            Result.Error(e)
        }
    }

    override suspend fun createMember(
        email: String,
        fullName: String,
        role: String,
        divisionIds: List<String>,
    ): Result<Profile> {
        log("createMember", "start email=$email fullName=$fullName role=$role divisionIds=$divisionIds")
        return try {
            val response = httpClient.post(ApiEndpoints.Members.BASE) {
                contentType(ContentType.Application.Json)
                setBody(CreateMemberRequest(email = email, fullName = fullName, role = role, divisionIds = divisionIds))
            }.body<ApiResponse<CreatedMemberDto>>()
            log("createMember", "response success=${response.success} hasData=${response.data != null} error=${response.error} message=${response.message}")
            if (response.success && response.data != null) {
                log("createMember", "OK email=${response.data.email}")
                Result.Success(response.data.toDomain())
            } else {
                log("createMember", "FAIL error=${response.error}")
                Result.Error(apiFailure(response))
            }
        } catch (e: Exception) {
            logErr("createMember", e)
            Result.Error(e)
        }
    }
}

@Serializable
private data class ProfileDto(
    @SerialName("id") val id: String,
    @SerialName("full_name") val fullName: String,
    @SerialName("email") val email: String,
)

/**
 * Backend `POST /members/create` returns `CreatedMemberInfo`
 * (`{ email, full_name, temporary_password, division? }`) — no `id` field.
 */
@Serializable
private data class CreatedMemberDto(
    @SerialName("email") val email: String,
    @SerialName("full_name") val fullName: String,
    @SerialName("temporary_password") val temporaryPassword: String? = null,
    @SerialName("division") val division: String? = null,
)

@Serializable
private data class MemberListPayloadDto(
    @SerialName("data") val data: List<ProfileDto> = emptyList(),
)

private fun ProfileDto.toDomain(): Profile = Profile(id = id, fullName = fullName, email = email)

private fun CreatedMemberDto.toDomain(): Profile =
    Profile(id = "", fullName = fullName, email = email)
