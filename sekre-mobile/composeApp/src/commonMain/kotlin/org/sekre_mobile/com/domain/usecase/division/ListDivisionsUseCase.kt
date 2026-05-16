package org.sekre_mobile.com.domain.usecase.division

import org.sekre_mobile.com.domain.entity.Division
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.DivisionRepository

class ListDivisionsUseCase(
    private val divisionRepository: DivisionRepository,
) {
    suspend operator fun invoke(): Result<List<Division>> = divisionRepository.listDivisions()
}
