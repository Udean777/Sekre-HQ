package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/pkg/logger"
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
				response.HandleError(w, r, domainerrors.Unauthorized("missing authorization header"))
				return
			}

			// Check Bearer prefix
			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				response.HandleError(w, r, domainerrors.Unauthorized("invalid authorization header format"))
				return
			}

			tokenString := parts[1]

			// Validate token
			claims, err := tokenManager.ValidateToken(tokenString)
			if err != nil {
				response.HandleError(w, r, domainerrors.ErrInvalidToken)
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

// CORS middleware has been moved to cors.go with proper config-based setup.
// Use CORS(cfg CORSConfig) instead of the old CORS(next http.Handler) form.

// Logging middleware with beautiful colored output
func Logging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Create a response writer wrapper to capture status code
		wrapped := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}

		// Process request
		next.ServeHTTP(wrapped, r)

		// Calculate duration
		duration := time.Since(start)

		// Get client IP
		ip := r.RemoteAddr
		if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
			ip = forwarded
		}

		// Log the request
		logger.HTTPRequest(r.Method, r.URL.Path, wrapped.statusCode, duration, ip)
	})
}

// responseWriter wraps http.ResponseWriter to capture status code
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}
