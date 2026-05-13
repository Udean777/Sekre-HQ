package middleware

import (
	"net/http"
)

// SecurityHeadersConfig configures which security headers are set and their values.
// Each field has a sensible secure default. Set to empty string to omit a header.
type SecurityHeadersConfig struct {
	// XContentTypeOptions protects against MIME-sniffing.
	// Default: "nosniff"
	XContentTypeOptions string

	// XFrameOptions protects against clickjacking.
	// Common values: "DENY", "SAMEORIGIN"
	// Default: "DENY"
	XFrameOptions string

	// ReferrerPolicy controls how much referrer info is sent.
	// Default: "strict-origin-when-cross-origin"
	ReferrerPolicy string

	// StrictTransportSecurity enables HSTS (HTTPS enforcement).
	// Should only be set in production with HTTPS.
	// Example: "max-age=63072000; includeSubDomains"
	// Default: empty (no HSTS - must be enabled explicitly for production)
	StrictTransportSecurity string

	// ContentSecurityPolicy restricts resource loading.
	// For JSON API: "default-src 'none'" is a safe default.
	// Default: "default-src 'none'; frame-ancestors 'none'"
	ContentSecurityPolicy string

	// PermissionsPolicy (formerly Feature-Policy) restricts browser feature access.
	// Default: locks down geolocation, microphone, camera, payment
	PermissionsPolicy string
}

// DefaultSecurityHeadersConfig returns secure defaults for a REST API.
// HSTS is disabled by default - enable it only in production with HTTPS.
func DefaultSecurityHeadersConfig() SecurityHeadersConfig {
	return SecurityHeadersConfig{
		XContentTypeOptions:     "nosniff",
		XFrameOptions:           "DENY",
		ReferrerPolicy:          "strict-origin-when-cross-origin",
		StrictTransportSecurity: "", // Disabled by default
		ContentSecurityPolicy:   "default-src 'none'; frame-ancestors 'none'",
		PermissionsPolicy:       "geolocation=(), microphone=(), camera=(), payment=()",
	}
}

// ProductionSecurityHeadersConfig returns secure defaults for production with HTTPS.
// Includes HSTS with a 2-year max-age and subdomain inclusion.
func ProductionSecurityHeadersConfig() SecurityHeadersConfig {
	cfg := DefaultSecurityHeadersConfig()
	cfg.StrictTransportSecurity = "max-age=63072000; includeSubDomains"
	return cfg
}

// SecurityHeaders returns a middleware that adds security-related HTTP headers
// to every response.
//
// The middleware follows the principle of "defense in depth" - each header
// provides a different layer of protection against common web vulnerabilities.
//
// References:
//   - OWASP Secure Headers Project: https://owasp.org/www-project-secure-headers/
//   - Mozilla Observatory: https://observatory.mozilla.org/
func SecurityHeaders(cfg SecurityHeadersConfig) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if cfg.XContentTypeOptions != "" {
				w.Header().Set("X-Content-Type-Options", cfg.XContentTypeOptions)
			}
			if cfg.XFrameOptions != "" {
				w.Header().Set("X-Frame-Options", cfg.XFrameOptions)
			}
			if cfg.ReferrerPolicy != "" {
				w.Header().Set("Referrer-Policy", cfg.ReferrerPolicy)
			}
			if cfg.StrictTransportSecurity != "" {
				w.Header().Set("Strict-Transport-Security", cfg.StrictTransportSecurity)
			}
			if cfg.ContentSecurityPolicy != "" {
				w.Header().Set("Content-Security-Policy", cfg.ContentSecurityPolicy)
			}
			if cfg.PermissionsPolicy != "" {
				w.Header().Set("Permissions-Policy", cfg.PermissionsPolicy)
			}

			next.ServeHTTP(w, r)
		})
	}
}
