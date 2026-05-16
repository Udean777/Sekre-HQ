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
import org.sekre_mobile.com.domain.entity.Profile
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.UserRepository

class UserRepositoryImpl(
    private val httpClient: HttpClient,
) : UserRepository {
    override suspend fun updateProfile(fullName: String?, email: String?): Result<Profile> {
        return try {
            val response = httpClient.patch(ApiEndpoints.Users.PROFILE) {
                contentType(ContentType.Application.Json)
                setBody(UpdateProfileRequest(fullName = fullName, email = email))
            }.body<ApiResponse<ProfileDto>>()

            if (response.success && response.data != null) {
                Result.Success(response.data.toDomain())
            } else {
                Result.Error(Exception(response.error ?: "Failed to update profile"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    override suspend fun changePassword(currentPassword: String, newPassword: String): Result<Unit> {
        return try {
            val response = httpClient.post(ApiEndpoints.Users.UPDATE_PASSWORD) {
                contentType(ContentType.Application.Json)
                setBody(ChangePasswordRequest(currentPassword, newPassword))
            }.body<ApiResponse<Unit>>()
            if (response.success) Result.Success(Unit)
            else Result.Error(Exception(response.error ?: "Failed to change password"))
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    override suspend fun listMembers(): Result<List<Profile>> {
        return try {
            val response = httpClient.get(ApiEndpoints.Members.LIST).body<ApiResponse<MemberListPayloadDto>>()
            if (response.success && response.data != null) {
                Result.Success(response.data.data.map { it.toDomain() })
            } else {
                Result.Error(Exception(response.error ?: "Failed to list members"))
            }
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    override suspend fun createMember(
        email: String,
        fullName: String,
        role: String,
        divisionIds: List<String>,
    ): Result<Profile> {
        return try {
            val response = httpClient.post(ApiEndpoints.Members.BASE) {
                contentType(ContentType.Application.Json)
                setBody(CreateMemberRequest(email = email, fullName = fullName, role = role, divisionIds = divisionIds))
            }.body<ApiResponse<ProfileDto>>()
            if (response.success && response.data != null) {
                Result.Success(response.data.toDomain())
            } else {
                Result.Error(Exception(response.error ?: "Failed to create member"))
            }
        } catch (e: Exception) {
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

@Serializable
private data class MemberListPayloadDto(
    @SerialName("data") val data: List<ProfileDto> = emptyList(),
)

private fun ProfileDto.toDomain(): Profile = Profile(id = id, fullName = fullName, email = email)
