// Package middleware provides HTTP middleware for the delivery layer.
package middleware

import (
	"net/http"
	"strconv"
	"strings"
)

// CORSConfig holds CORS configuration.
// All fields are required for security: empty AllowedOrigins blocks all CORS requests.
type CORSConfig struct {
	// AllowedOrigins is the explicit list of origins allowed to make CORS requests.
	// Use "*" only when AllowCredentials is false (browsers reject this combination).
	AllowedOrigins []string

	// AllowedMethods are the HTTP methods accepted in CORS requests.
	AllowedMethods []string

	// AllowedHeaders are the request headers accepted in CORS requests.
	AllowedHeaders []string

	// ExposedHeaders are response headers the browser is allowed to expose to JavaScript.
	ExposedHeaders []string

	// AllowCredentials controls whether browsers send cookies/auth headers.
	// MUST NOT be true if AllowedOrigins contains "*".
	AllowCredentials bool

	// MaxAge is the number of seconds browsers may cache preflight responses.
	MaxAge int
}

// DefaultCORSConfig returns a sensible default for development.
// Production should override AllowedOrigins via configuration.
func DefaultCORSConfig() CORSConfig {
	return CORSConfig{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization", "Accept", "X-Request-ID"},
		ExposedHeaders:   []string{"X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           3600,
	}
}

// CORS returns a middleware that handles Cross-Origin Resource Sharing.
//
// Security properties:
//   - Only origins in cfg.AllowedOrigins are allowed (no wildcard if credentials enabled)
//   - Sets "Vary: Origin" so caches do not serve wrong CORS headers
//   - Returns 204 No Content on OPTIONS preflight
//   - Origin is reflected from the request, not echoed blindly
func CORS(cfg CORSConfig) func(http.Handler) http.Handler {
	// Pre-compute lookup map for O(1) origin check
	allowed := make(map[string]struct{}, len(cfg.AllowedOrigins))
	for _, origin := range cfg.AllowedOrigins {
		allowed[origin] = struct{}{}
	}

	// Pre-compute joined header strings (avoid join on every request)
	methodsStr := strings.Join(cfg.AllowedMethods, ", ")
	headersStr := strings.Join(cfg.AllowedHeaders, ", ")
	exposedStr := strings.Join(cfg.ExposedHeaders, ", ")
	maxAgeStr := strconv.Itoa(cfg.MaxAge)

	// Wildcard support (only when credentials disabled)
	allowWildcard := false
	if _, ok := allowed["*"]; ok && !cfg.AllowCredentials {
		allowWildcard = true
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")

			// Determine the response origin
			responseOrigin := ""
			if allowWildcard {
				responseOrigin = "*"
			} else if origin != "" {
				if _, ok := allowed[origin]; ok {
					responseOrigin = origin
				}
			}

			// Set CORS headers only if origin is allowed
			if responseOrigin != "" {
				w.Header().Set("Access-Control-Allow-Origin", responseOrigin)
				w.Header().Add("Vary", "Origin")

				if cfg.AllowCredentials {
					w.Header().Set("Access-Control-Allow-Credentials", "true")
				}

				if exposedStr != "" {
					w.Header().Set("Access-Control-Expose-Headers", exposedStr)
				}
			}

			// Handle preflight requests
			if r.Method == http.MethodOptions {
				if responseOrigin != "" {
					w.Header().Set("Access-Control-Allow-Methods", methodsStr)
					w.Header().Set("Access-Control-Allow-Headers", headersStr)
					if cfg.MaxAge > 0 {
						w.Header().Set("Access-Control-Max-Age", maxAgeStr)
					}
					w.Header().Add("Vary", "Access-Control-Request-Method")
					w.Header().Add("Vary", "Access-Control-Request-Headers")
				}
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
