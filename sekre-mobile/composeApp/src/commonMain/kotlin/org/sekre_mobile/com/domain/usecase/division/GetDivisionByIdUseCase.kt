package org.sekre_mobile.com.domain.usecase.division

import org.sekre_mobile.com.domain.entity.Division
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.DivisionRepository

class GetDivisionByIdUseCase(
    private val divisionRepository: DivisionRepository,
) {
    suspend operator fun invoke(id: String): Result<Division> {
        if (id.isBlank()) return Result.Error(Exception("Division id is required"))
        return divisionRepository.getDivisionById(id)
    }
}
