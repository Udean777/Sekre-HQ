package org.sekre_mobile.com.domain.usecase.division

import org.sekre_mobile.com.domain.entity.Division
import org.sekre_mobile.com.domain.model.Result
import org.sekre_mobile.com.domain.repository.DivisionRepository

class UpdateDivisionUseCase(
    private val divisionRepository: DivisionRepository,
) {
    suspend operator fun invoke(id: String, name: String): Result<Division> {
        if (id.isBlank()) {
            return Result.Error(Exception("Division id is required"))
        }
        val trimmed = name.trim()
        if (trimmed.isBlank()) {
            return Result.Error(Exception("Nama divisi tidak boleh kosong"))
        }
        if (trimmed.length > 100) {
            return Result.Error(Exception("Nama divisi maksimal 100 karakter"))
        }
        return divisionRepository.updateDivision(id, trimmed)
    }
}
