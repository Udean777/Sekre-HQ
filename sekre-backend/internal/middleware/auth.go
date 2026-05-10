package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/username/sekre-backend/internal/domain"
	"github.com/username/sekre-backend/pkg/response"
	"github.com/username/sekre-backend/pkg/token"
)

type contextKey string

const (
	UserIDKey         contextKey = "user_id"
	OrganizationIDKey contextKey = "organization_id"
	RoleKey           contextKey = "role"
)

// AuthMiddleware validates JWT token and adds user context
func AuthMiddleware(tokenManager *token.Manager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract token from Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				response.Unauthorized(w, "missing authorization header")
				return
			}

			// Check Bearer prefix
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				response.Unauthorized(w, "invalid authorization header format")
				return
			}

			tokenString := parts[1]

			// Validate token
			claims, err := tokenManager.ValidateToken(tokenString)
			if err != nil {
				response.Unauthorized(w, domain.ErrInvalidToken.Error())
				return
			}

			// Add claims to context
			ctx := context.WithValue(r.Context(), UserIDKey, claims.UserID)
			ctx = context.WithValue(ctx, OrganizationIDKey, claims.OrganizationID)
			ctx = context.WithValue(ctx, RoleKey, claims.Role)

			// Call next handler with updated context
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// CORS middleware
func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Logging middleware
func Logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Simple logging - can be enhanced with structured logging
		next.ServeHTTP(w, r)
	})
}
