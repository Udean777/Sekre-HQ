package org.sekre_mobile.com.domain.usecase.division

import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.DivisionRepository

class DeleteDivisionUseCase(
    private val divisionRepository: DivisionRepository,
) {
    suspend operator fun invoke(id: String): Result<Unit> {
        if (id.isBlank()) {
            return Result.Error(Exception("Division id is required"))
        }
        return divisionRepository.deleteDivision(id)
    }
}
