package middleware

import (
	"net/http"

	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/pkg/response"
)

// RequireRole returns a middleware that allows only requests where the
// authenticated user has one of the given roles.
//
// The role is read from the request context (set by AuthMiddleware).
// If the context has no role, returns 401 Unauthorized.
// If the role is not in the allowed list, returns 403 Forbidden.
//
// Usage:
//
//	adminOnly := middleware.RequireRole(types.RoleOwner, types.RoleAdmin)
//	router.Handle("/admin/users", adminOnly(handler))
//
// This middleware MUST be chained after AuthMiddleware.
func RequireRole(allowedRoles ...types.Role) func(http.Handler) http.Handler {
	// Pre-compute allowed roles set for O(1) lookup
	allowed := make(map[types.Role]struct{}, len(allowedRoles))
	for _, role := range allowedRoles {
		allowed[role] = struct{}{}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract role from context
			role, ok := r.Context().Value(RoleKey).(types.Role)
			if !ok {
				response.HandleError(w, r, domainerrors.Unauthorized("missing role in context"))
				return
			}

			// Check if role is allowed
			if _, allowedRole := allowed[role]; !allowedRole {
				response.HandleError(w, r, domainerrors.Forbidden("access", "resource").
					WithDetail("required_roles", allowedRoleNames(allowedRoles)).
					WithDetail("user_role", string(role)))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// RequireOwner is a convenience middleware that allows only Owner role.
func RequireOwner() func(http.Handler) http.Handler {
	return RequireRole(types.RoleOwner)
}

// RequireAdmin is a convenience middleware that allows Owner or Admin roles.
// (Owner has all admin permissions in this domain model.)
func RequireAdmin() func(http.Handler) http.Handler {
	return RequireRole(types.RoleOwner, types.RoleAdmin)
}

// RequireMember is a convenience middleware that allows any authenticated user
// with a valid role (Owner, Admin, or Member).
func RequireMember() func(http.Handler) http.Handler {
	return RequireRole(types.RoleOwner, types.RoleAdmin, types.RoleMember)
}

// allowedRoleNames converts role slice to string slice for error details.
func allowedRoleNames(roles []types.Role) []string {
	names := make([]string, len(roles))
	for i, r := range roles {
		names[i] = string(r)
	}
	return names
}
