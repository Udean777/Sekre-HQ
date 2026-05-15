package org.sekre_mobile.com.domain.entity

/** Auth Domain Entities Pure business object - no framework dependencies */
data class User(val id: String, val email: String, val fullName: String, val createdAt: Long) {
    /** Get user initials for avatar */
    fun getInitials(): String {
        val names = fullName.split(" ")
        return if (names.size == 1) {
            names[0].take(2).uppercase()
        } else {
            (names.first().first().toString() + names.last().first().toString()).uppercase()
        }
    }
}

enum class SubscriptionPlan {
    FREE,
    LITE,
    PRO
}

data class Organization(
    val id: String,
    val name: String,
    val subdomain: String,
    val subscriptionPlan: SubscriptionPlan,
    val createdAt: Long
) {
    /** Check if organization is on free plan */
    fun isFreePlan(): Boolean = subscriptionPlan == SubscriptionPlan.FREE

    /** Check if organization is on lite plan */
    fun isLitePlan(): Boolean = subscriptionPlan == SubscriptionPlan.LITE

    /** Check if organization is on pro plan */
    fun isProPlan(): Boolean = subscriptionPlan == SubscriptionPlan.PRO
}

enum class UserRole {
    OWNER,
    ADMIN,
    MEMBER
}

data class AuthenticatedUser(val user: User, val organization: Organization, val role: UserRole) {
    /** Check if user is owner */
    fun isOwner(): Boolean = role == UserRole.OWNER

    /** Check if user is admin */
    fun isAdmin(): Boolean = role == UserRole.ADMIN

    /** Check if user is member */
    fun isMember(): Boolean = role == UserRole.MEMBER

    /** Check if user has admin privileges (owner or admin) */
    fun hasAdminPrivileges(): Boolean = isOwner() || isAdmin()
}
