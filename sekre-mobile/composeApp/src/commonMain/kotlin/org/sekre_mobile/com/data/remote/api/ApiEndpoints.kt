package org.sekre_mobile.com.data.remote.api

/** API Endpoints Infrastructure layer - centralized endpoint definitions */
object ApiEndpoints {
    // Auth endpoints
    object Auth {
        const val LOGIN = "/auth/login"
        const val REGISTER = "/auth/register"
        const val LOGOUT = "/auth/logout"
        const val REFRESH_TOKEN = "/auth/refresh"
        const val ME = "/auth/me"
    }

    // Task endpoints
    object Tasks {
        const val BASE = "/tasks"
        fun byId(id: String) = "/tasks/$id"
        fun updateStatus(id: String) = "/tasks/$id/status"
    }

    // Event endpoints
    object Events {
        const val BASE = "/events"
        fun byId(id: String) = "/events/$id"
    }

    // Transaction endpoints
    object Transactions {
        const val BASE = "/transactions"
        fun byId(id: String) = "/transactions/$id"
        fun approve(id: String) = "/transactions/$id/approve"
        const val SUMMARY = "/transactions/summary"
    }

    // Division endpoints
    object Divisions {
        const val BASE = "/divisions"
        fun byId(id: String) = "/divisions/$id"
        fun members(id: String) = "/divisions/$id/members"
        fun addMember(id: String) = "/divisions/$id/members"
        fun removeMember(divisionId: String, userId: String) =
            "/divisions/$divisionId/members/$userId"

        fun updateMemberRole(divisionId: String, userId: String) =
            "/divisions/$divisionId/members/$userId/role"
    }

    // Organization endpoints
    object Organizations {
        const val BASE = "/organizations"
        const val CURRENT = "/organizations/current"
        fun byId(id: String) = "/organizations/$id"
    }

    // Member endpoints
    object Members {
        const val BASE = "/members"
        fun byId(id: String) = "/members/$id"
        const val TEMPLATE = "/members/template"
        const val BULK_IMPORT = "/members/bulk-import"
    }

    // User endpoints
    object Users {
        const val BASE = "/users"
        const val PROFILE = "/users/profile"
        const val UPDATE_PASSWORD = "/users/password"
    }
}
