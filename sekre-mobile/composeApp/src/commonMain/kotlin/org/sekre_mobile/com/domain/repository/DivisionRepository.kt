package org.sekre_mobile.com.domain.repository

import org.sekre_mobile.com.domain.entity.Division
import org.sekre_mobile.com.domain.entity.DivisionMemberUser
import org.sekre_mobile.com.domain.model.Result

/** Division Repository Interface Domain layer - defines contract for data access */
interface DivisionRepository {
    /** Create a new division */
    suspend fun createDivision(name: String): Result<Division>

    /** Get division by ID */
    suspend fun getDivisionById(id: String): Result<Division>

    /** List all divisions */
    suspend fun listDivisions(): Result<List<Division>>

    /** Update division */
    suspend fun updateDivision(id: String, name: String): Result<Division>

    /** Delete division */
    suspend fun deleteDivision(id: String): Result<Unit>

    /** List members of a specific division (used e.g. for task assignee picker). */
    suspend fun listDivisionMembers(divisionId: String): Result<List<DivisionMemberUser>>
}
