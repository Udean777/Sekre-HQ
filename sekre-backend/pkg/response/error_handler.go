package response

import (
	"net/http"

	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/pkg/logger"
	"github.com/username/sekre-backend/pkg/requestid"
)

// errorCodeToHTTP maps DomainError categories to HTTP status codes. This
// lookup table is the single source of truth for transport-level mapping;
// handlers should never need to reimplement it.
var errorCodeToHTTP = map[domainerrors.ErrorCode]int{
	domainerrors.CodeNotFound:     http.StatusNotFound,
	domainerrors.CodeUnauthorized: http.StatusUnauthorized,
	domainerrors.CodeForbidden:    http.StatusForbidden,
	domainerrors.CodeInvalidInput: http.StatusBadRequest,
	domainerrors.CodeConflict:     http.StatusConflict,
	domainerrors.CodePrecondition: http.StatusPreconditionFailed,
	domainerrors.CodeInternal:     http.StatusInternalServerError,
}

// HandleError is the canonical entry point for turning an error returned by
// the usecase/domain layer into an HTTP response.
//
// It performs two jobs:
//  1. Log the full error (with Details, Cause, and request ID) at the
//     appropriate level so operators can debug without the client being
//     involved.
//  2. Write a minimal, client-safe response body containing the DomainError
//     code, message, and the request ID for cross-log correlation.
//
// Non-domain errors (e.g. a bug that panicked into an unwrapped error) are
// mapped to a generic 500 to avoid leaking internals.
func HandleError(w http.ResponseWriter, r *http.Request, err error) {
	reqID := requestid.FromContext(r.Context())

	if err == nil {
		// Defensive: HandleError should never be called with a nil error,
		// but if it is, fall back to a generic 500 rather than writing an
		// empty body with a success status code.
		logger.Logger.Error().
			Str("request_id", reqID).
			Str("method", r.Method).
			Str("path", r.URL.Path).
			Msg("HandleError called with nil error")
		writeErrorResponse(w, http.StatusInternalServerError, domainerrors.CodeInternal, "internal server error", reqID)
		return
	}

	if de, ok := domainerrors.As(err); ok {
		logDomainError(r, de, reqID)
		status := httpStatusForCode(de.Code)
		writeErrorResponse(w, status, de.Code, de.Message, reqID)
		return
	}

	// Unknown / non-domain error: log the full thing, return a generic 500.
	logger.Logger.Error().
		Str("request_id", reqID).
		Str("method", r.Method).
		Str("path", r.URL.Path).
		Err(err).
		Msg("Unhandled non-domain error")

	writeErrorResponse(w, http.StatusInternalServerError, domainerrors.CodeInternal, "internal server error", reqID)
}

// httpStatusForCode returns the HTTP status code for a DomainError code,
// defaulting to 500 for unknown codes.
func httpStatusForCode(code domainerrors.ErrorCode) int {
	if s, ok := errorCodeToHTTP[code]; ok {
		return s
	}
	return http.StatusInternalServerError
}

// logDomainError writes a structured log line for a DomainError. Level is
// chosen by category: client errors (4xx-ish) are warnings because they are
// usually the caller's fault, while internal errors go to error level.
func logDomainError(r *http.Request, de *domainerrors.DomainError, requestID string) {
	base := logger.Logger.With().
		Str("request_id", requestID).
		Str("method", r.Method).
		Str("path", r.URL.Path).
		Str("code", string(de.Code)).
		Interface("details", de.Details).
		Logger()

	event := base.Warn()
	if de.Code == domainerrors.CodeInternal {
		event = base.Error()
	}
	if de.Cause != nil {
		event = event.Err(de.Cause)
	}
	event.Msg(de.Message)
}

// writeErrorResponse writes the uniform error envelope to w.
func writeErrorResponse(w http.ResponseWriter, status int, code domainerrors.ErrorCode, message, requestID string) {
	JSON(w, status, ErrorResponse{
		Success:   false,
		Code:      string(code),
		Message:   message,
		RequestID: requestID,
	})
}
