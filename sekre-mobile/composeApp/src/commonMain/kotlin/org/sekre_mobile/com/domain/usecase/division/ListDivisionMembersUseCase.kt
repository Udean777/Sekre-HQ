package org.sekre_mobile.com.domain.usecase.division

import org.sekre_mobile.com.domain.entity.DivisionMemberUser
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.DivisionRepository

/**
 * Loads members of a specific division. Used e.g. by Task create/edit screens
 * to populate the assignee picker, since the backend requires the assignee to
 * be a member of the task's division.
 */
class ListDivisionMembersUseCase(
    private val divisionRepository: DivisionRepository,
) {
    suspend operator fun invoke(divisionId: String): Result<List<DivisionMemberUser>> {
        if (divisionId.isBlank()) {
            return Result.Error(IllegalArgumentException("divisionId is required"))
        }
        return divisionRepository.listDivisionMembers(divisionId)
    }
}
