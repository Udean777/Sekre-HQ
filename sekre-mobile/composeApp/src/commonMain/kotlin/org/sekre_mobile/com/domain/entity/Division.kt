package org.sekre_mobile.com.domain.entity

/** Division Domain Entity Pure business object - no framework dependencies */
data class Division(
    val id: String,
    val organizationId: String,
    val name: String,
    val createdAt: Long,
    val updatedAt: Long
) {
    /** Check if division can be deleted */
    fun canBeDeleted(): Boolean = true

    /** Check if division can be edited */
    fun canBeEdited(): Boolean = true
}

enum class DivisionRole {
    HEAD,
    STAFF
}

data class DivisionMember(
    val divisionId: String,
    val userId: String,
    val divisionRole: DivisionRole
)
