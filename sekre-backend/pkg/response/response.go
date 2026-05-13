package response

import (
	"encoding/json"
	"net/http"
)

// Response is the standard successful response envelope. The Error field is
// retained for backward compatibility but new code should prefer
// ErrorResponse + HandleError for error paths.
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// ErrorResponse is the uniform error body returned by the delivery layer.
// It is intentionally minimal: only a stable machine-readable Code, a short
// human-readable Message, and a RequestID for cross-log correlation.
// Internal context (stack traces, SQL errors, etc.) MUST be logged instead
// of being returned to the client.
type ErrorResponse struct {
	Success   bool   `json:"success"`
	Code      string `json:"code"`
	Message   string `json:"message"`
	RequestID string `json:"request_id,omitempty"`
}

// JSON sends a JSON response with the given status code and payload.
func JSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(data)
}

// Success sends a 2xx response wrapping data in the standard envelope.
func Success(w http.ResponseWriter, statusCode int, message string, data interface{}) {
	JSON(w, statusCode, Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// Error sends a non-2xx response using the legacy Response envelope.
//
// Deprecated: prefer HandleError, which understands DomainError categories
// and logs full context without leaking it to clients. Error remains for
// call sites that have not migrated yet.
func Error(w http.ResponseWriter, statusCode int, message string) {
	JSON(w, statusCode, Response{
		Success: false,
		Error:   message,
	})
}

// BadRequest sends a 400 Bad Request response.
//
// Deprecated: prefer HandleError with a DomainError.
func BadRequest(w http.ResponseWriter, message string) {
	Error(w, http.StatusBadRequest, message)
}

// Unauthorized sends a 401 Unauthorized response.
//
// Deprecated: prefer HandleError with a DomainError.
func Unauthorized(w http.ResponseWriter, message string) {
	Error(w, http.StatusUnauthorized, message)
}

// Forbidden sends a 403 Forbidden response.
//
// Deprecated: prefer HandleError with a DomainError.
func Forbidden(w http.ResponseWriter, message string) {
	Error(w, http.StatusForbidden, message)
}

// NotFound sends a 404 Not Found response.
//
// Deprecated: prefer HandleError with a DomainError.
func NotFound(w http.ResponseWriter, message string) {
	Error(w, http.StatusNotFound, message)
}

// InternalServerError sends a 500 Internal Server Error response.
//
// Deprecated: prefer HandleError with a DomainError.
func InternalServerError(w http.ResponseWriter, message string) {
	Error(w, http.StatusInternalServerError, message)
}
