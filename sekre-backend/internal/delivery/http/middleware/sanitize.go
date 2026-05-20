package middleware

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"strings"

	"github.com/microcosm-cc/bluemonday"
)

// sensitiveFieldNames is the set of JSON keys whose string values must NOT be
// modified by SanitizeInput. These fields carry credentials/tokens where any
// transformation (HTML stripping, whitespace trimming) could silently change
// the user-provided value and cause auth mismatches.
//
// Comparison is case-insensitive against the JSON key.
var sensitiveFieldNames = map[string]struct{}{
	"password":         {},
	"current_password": {},
	"new_password":     {},
	"old_password":     {},
	"confirm_password": {},
	"password_hash":    {},
	"refresh_token":    {},
	"access_token":     {},
	"token":            {},
}

// isSensitiveField reports whether the given JSON key should bypass sanitization.
func isSensitiveField(key string) bool {
	_, ok := sensitiveFieldNames[strings.ToLower(key)]
	return ok
}

// SanitizeInput middleware sanitizes all string inputs in JSON request bodies
// to prevent XSS attacks. It uses bluemonday's StrictPolicy which strips all HTML tags.
//
// The middleware:
// - Reads and parses the request body
// - Recursively sanitizes all string fields
// - Replaces the request body with sanitized content
// - Preserves non-string fields unchanged
//
// Note: This adds overhead to every request. Consider applying selectively
// to endpoints that accept user-generated content.
func SanitizeInput() func(http.Handler) http.Handler {
	// Create a strict policy that strips all HTML
	policy := bluemonday.StrictPolicy()

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Only sanitize requests with JSON body
			if r.Method == http.MethodGet || r.Method == http.MethodDelete || r.Method == http.MethodHead {
				next.ServeHTTP(w, r)
				return
			}

			contentType := r.Header.Get("Content-Type")
			if !strings.Contains(contentType, "application/json") {
				next.ServeHTTP(w, r)
				return
			}

			// Read body
			body, err := io.ReadAll(r.Body)
			if err != nil {
				next.ServeHTTP(w, r)
				return
			}
			r.Body.Close()

			// If body is empty, skip sanitization
			if len(body) == 0 {
				r.Body = io.NopCloser(bytes.NewReader(body))
				next.ServeHTTP(w, r)
				return
			}

			// Parse JSON
			var data interface{}
			if err := json.Unmarshal(body, &data); err != nil {
				// If not valid JSON, pass through unchanged
				r.Body = io.NopCloser(bytes.NewReader(body))
				next.ServeHTTP(w, r)
				return
			}

			// Sanitize data
			sanitized := sanitizeValue(data, policy)

			// Marshal back to JSON
			sanitizedBody, err := json.Marshal(sanitized)
			if err != nil {
				// If marshaling fails, use original body
				r.Body = io.NopCloser(bytes.NewReader(body))
				next.ServeHTTP(w, r)
				return
			}

			// Replace request body with sanitized version
			r.Body = io.NopCloser(bytes.NewReader(sanitizedBody))
			r.ContentLength = int64(len(sanitizedBody))

			next.ServeHTTP(w, r)
		})
	}
}

// sanitizeValue recursively sanitizes all string values in a data structure.
func sanitizeValue(data interface{}, policy *bluemonday.Policy) interface{} {
	if data == nil {
		return nil
	}

	switch v := data.(type) {
	case string:
		// Sanitize string: strip HTML and trim whitespace
		sanitized := policy.Sanitize(v)
		return strings.TrimSpace(sanitized)

	case map[string]interface{}:
		// Recursively sanitize map values, skipping sensitive fields whose
		// values must be preserved exactly as the client sent them
		// (e.g. password, refresh_token).
		result := make(map[string]interface{}, len(v))
		for key, value := range v {
			if isSensitiveField(key) {
				result[key] = value
				continue
			}
			result[key] = sanitizeValue(value, policy)
		}
		return result

	case []interface{}:
		// Recursively sanitize array elements
		result := make([]interface{}, len(v))
		for i, value := range v {
			result[i] = sanitizeValue(value, policy)
		}
		return result

	default:
		// Return other types unchanged (numbers, booleans, etc.)
		return v
	}
}

// SanitizeString sanitizes a single string value using bluemonday's strict policy.
// This is useful for sanitizing individual fields outside the middleware.
func SanitizeString(input string) string {
	policy := bluemonday.StrictPolicy()
	return strings.TrimSpace(policy.Sanitize(input))
}

// ValidateEmail checks if an email format is valid.
// This is a basic check; in production, consider using a more robust validator.
func ValidateEmail(email string) bool {
	email = strings.TrimSpace(email)
	if len(email) < 3 || len(email) > 254 {
		return false
	}
	// Basic email format check
	atIndex := strings.LastIndex(email, "@")
	if atIndex < 1 || atIndex == len(email)-1 {
		return false
	}
	dotIndex := strings.LastIndex(email, ".")
	if dotIndex < atIndex+2 || dotIndex == len(email)-1 {
		return false
	}
	return true
}

// ValidateStringLength checks if a string is within the specified length range.
func ValidateStringLength(s string, min, max int) bool {
	length := len(strings.TrimSpace(s))
	return length >= min && length <= max
}

// SanitizeAndValidate combines sanitization and validation for common use cases.
type StringValidator struct {
	MinLength int
	MaxLength int
	Required  bool
}

// Validate sanitizes and validates a string according to the validator rules.
func (v StringValidator) Validate(input string) (string, bool) {
	sanitized := SanitizeString(input)

	if v.Required && sanitized == "" {
		return "", false
	}

	if !v.Required && sanitized == "" {
		return "", true
	}

	if !ValidateStringLength(sanitized, v.MinLength, v.MaxLength) {
		return sanitized, false
	}

	return sanitized, true
}

// Common validators for reuse
var (
	// NameValidator validates names (1-100 characters)
	NameValidator = StringValidator{MinLength: 1, MaxLength: 100, Required: true}

	// DescriptionValidator validates descriptions (0-1000 characters, optional)
	DescriptionValidator = StringValidator{MinLength: 0, MaxLength: 1000, Required: false}

	// SubdomainValidator validates subdomains (3-63 characters)
	SubdomainValidator = StringValidator{MinLength: 3, MaxLength: 63, Required: true}

	// TitleValidator validates titles (1-200 characters)
	TitleValidator = StringValidator{MinLength: 1, MaxLength: 200, Required: true}
)
