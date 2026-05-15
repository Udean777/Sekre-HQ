package org.sekre_mobile.com.domain.usecase.member

import org.sekre_mobile.com.domain.entity.Profile
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.UserRepository

class ListMembersUseCase(
    private val userRepository: UserRepository,
) {
    suspend operator fun invoke(): Result<List<Profile>> = userRepository.listMembers()
}
