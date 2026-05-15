package org.sekre_mobile.com.domain.repository

import org.sekre_mobile.com.domain.entity.Profile
import org.sekre_mobile.com.domain.model.Result

interface UserRepository {
    suspend fun updateProfile(fullName: String?, email: String?): Result<Profile>
    suspend fun changePassword(currentPassword: String, newPassword: String): Result<Unit>
    suspend fun listMembers(): Result<List<Profile>>
    suspend fun createMember(
        email: String,
        fullName: String,
        role: String,
        divisionIds: List<String>,
    ): Result<Profile>
}
