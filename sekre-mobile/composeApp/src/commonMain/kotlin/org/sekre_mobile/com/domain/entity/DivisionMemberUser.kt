package org.sekre_mobile.com.domain.entity

/**
 * Represents a member of a division (user + their role in that division).
 * Used by Task assignee picker, Division detail, etc.
 */
data class DivisionMemberUser(
    val id: String,
    val email: String,
    val fullName: String,
    val divisionRole: DivisionRole,
)
