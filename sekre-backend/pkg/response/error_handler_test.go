package response_test

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/pkg/requestid"
	"github.com/username/sekre-backend/pkg/response"
)

func TestHandleError_DomainError_NotFound(t *testing.T) {
	t.Parallel()

	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodGet, "/api/v1/users/123", nil)
	ctx := requestid.WithID(context.Background(), "test-request-id")
	r = r.WithContext(ctx)

	err := domainerrors.NotFound("user", "123")

	response.HandleError(w, r, err)

	if w.Code != http.StatusNotFound {
		t.Errorf("expected status %d, got %d", http.StatusNotFound, w.Code)
	}

	var resp response.ErrorResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Success {
		t.Error("expected success to be false")
	}

	if resp.Code != string(domainerrors.CodeNotFound) {
		t.Errorf("expected code %s, got %s", domainerrors.CodeNotFound, resp.Code)
	}

	if resp.RequestID != "test-request-id" {
		t.Errorf("expected request ID %s, got %s", "test-request-id", resp.RequestID)
	}
}

func TestHandleError_DomainError_Unauthorized(t *testing.T) {
	t.Parallel()

	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", nil)
	ctx := requestid.WithID(context.Background(), "auth-req-123")
	r = r.WithContext(ctx)

	err := domainerrors.ErrInvalidCredentials

	response.HandleError(w, r, err)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected status %d, got %d", http.StatusUnauthorized, w.Code)
	}

	var resp response.ErrorResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Code != string(domainerrors.CodeUnauthorized) {
		t.Errorf("expected code %s, got %s", domainerrors.CodeUnauthorized, resp.Code)
	}
}

func TestHandleError_DomainError_Forbidden(t *testing.T) {
	t.Parallel()

	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodDelete, "/api/v1/organizations/456", nil)
	ctx := requestid.WithID(context.Background(), "forbidden-req")
	r = r.WithContext(ctx)

	err := domainerrors.Forbidden("delete", "organization")

	response.HandleError(w, r, err)

	if w.Code != http.StatusForbidden {
		t.Errorf("expected status %d, got %d", http.StatusForbidden, w.Code)
	}

	var resp response.ErrorResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Code != string(domainerrors.CodeForbidden) {
		t.Errorf("expected code %s, got %s", domainerrors.CodeForbidden, resp.Code)
	}
}

func TestHandleError_DomainError_InvalidInput(t *testing.T) {
	t.Parallel()

	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodPost, "/api/v1/users", nil)
	ctx := requestid.WithID(context.Background(), "validation-req")
	r = r.WithContext(ctx)

	err := domainerrors.InvalidInput("email", "invalid format")

	response.HandleError(w, r, err)

	if w.Code != http.StatusBadRequest {
		t.Errorf("expected status %d, got %d", http.StatusBadRequest, w.Code)
	}

	var resp response.ErrorResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Code != string(domainerrors.CodeInvalidInput) {
		t.Errorf("expected code %s, got %s", domainerrors.CodeInvalidInput, resp.Code)
	}
}

func TestHandleError_DomainError_Conflict(t *testing.T) {
	t.Parallel()

	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodPost, "/api/v1/users", nil)
	ctx := requestid.WithID(context.Background(), "conflict-req")
	r = r.WithContext(ctx)

	err := domainerrors.Conflict("user", "email already exists")

	response.HandleError(w, r, err)

	if w.Code != http.StatusConflict {
		t.Errorf("expected status %d, got %d", http.StatusConflict, w.Code)
	}

	var resp response.ErrorResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Code != string(domainerrors.CodeConflict) {
		t.Errorf("expected code %s, got %s", domainerrors.CodeConflict, resp.Code)
	}
}

func TestHandleError_DomainError_Precondition(t *testing.T) {
	t.Parallel()

	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodPut, "/api/v1/tasks/789", nil)
	ctx := requestid.WithID(context.Background(), "precondition-req")
	r = r.WithContext(ctx)

	err := domainerrors.Precondition("cannot complete task with pending subtasks")

	response.HandleError(w, r, err)

	if w.Code != http.StatusPreconditionFailed {
		t.Errorf("expected status %d, got %d", http.StatusPreconditionFailed, w.Code)
	}

	var resp response.ErrorResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Code != string(domainerrors.CodePrecondition) {
		t.Errorf("expected code %s, got %s", domainerrors.CodePrecondition, resp.Code)
	}
}

func TestHandleError_DomainError_Internal(t *testing.T) {
	t.Parallel()

	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodGet, "/api/v1/reports", nil)
	ctx := requestid.WithID(context.Background(), "internal-req")
	r = r.WithContext(ctx)

	err := domainerrors.Internal("database query", errors.New("connection timeout"))

	response.HandleError(w, r, err)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}

	var resp response.ErrorResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Code != string(domainerrors.CodeInternal) {
		t.Errorf("expected code %s, got %s", domainerrors.CodeInternal, resp.Code)
	}
}

func TestHandleError_DomainError_Timeout(t *testing.T) {
	t.Parallel()

	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodGet, "/api/v1/export", nil)
	ctx := requestid.WithID(context.Background(), "timeout-req")
	r = r.WithContext(ctx)

	err := domainerrors.Timeout("export operation")

	response.HandleError(w, r, err)

	if w.Code != http.StatusRequestTimeout {
		t.Errorf("expected status %d, got %d", http.StatusRequestTimeout, w.Code)
	}

	var resp response.ErrorResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Code != string(domainerrors.CodeTimeout) {
		t.Errorf("expected code %s, got %s", domainerrors.CodeTimeout, resp.Code)
	}
}

func TestHandleError_NonDomainError(t *testing.T) {
	t.Parallel()

	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodGet, "/api/v1/unknown", nil)
	ctx := requestid.WithID(context.Background(), "unknown-req")
	r = r.WithContext(ctx)

	err := errors.New("some random error")

	response.HandleError(w, r, err)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}

	var resp response.ErrorResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Code != string(domainerrors.CodeInternal) {
		t.Errorf("expected code %s, got %s", domainerrors.CodeInternal, resp.Code)
	}

	if resp.Message != "internal server error" {
		t.Errorf("expected generic message, got %s", resp.Message)
	}
}

func TestHandleError_NilError(t *testing.T) {
	t.Parallel()

	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodGet, "/api/v1/test", nil)
	ctx := requestid.WithID(context.Background(), "nil-error-req")
	r = r.WithContext(ctx)

	response.HandleError(w, r, nil)

	if w.Code != http.StatusInternalServerError {
		t.Errorf("expected status %d, got %d", http.StatusInternalServerError, w.Code)
	}

	var resp response.ErrorResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp.Code != string(domainerrors.CodeInternal) {
		t.Errorf("expected code %s, got %s", domainerrors.CodeInternal, resp.Code)
	}
}

func TestHandleError_AllErrorCodes(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name           string
		err            error
		expectedStatus int
		expectedCode   domainerrors.ErrorCode
	}{
		{
			name:           "not found",
			err:            domainerrors.NotFound("resource", "id"),
			expectedStatus: http.StatusNotFound,
			expectedCode:   domainerrors.CodeNotFound,
		},
		{
			name:           "unauthorized",
			err:            domainerrors.ErrInvalidCredentials,
			expectedStatus: http.StatusUnauthorized,
			expectedCode:   domainerrors.CodeUnauthorized,
		},
		{
			name:           "forbidden",
			err:            domainerrors.Forbidden("action", "resource"),
			expectedStatus: http.StatusForbidden,
			expectedCode:   domainerrors.CodeForbidden,
		},
		{
			name:           "invalid input",
			err:            domainerrors.InvalidInput("field", "reason"),
			expectedStatus: http.StatusBadRequest,
			expectedCode:   domainerrors.CodeInvalidInput,
		},
		{
			name:           "conflict",
			err:            domainerrors.Conflict("resource", "reason"),
			expectedStatus: http.StatusConflict,
			expectedCode:   domainerrors.CodeConflict,
		},
		{
			name:           "precondition",
			err:            domainerrors.Precondition("reason"),
			expectedStatus: http.StatusPreconditionFailed,
			expectedCode:   domainerrors.CodePrecondition,
		},
		{
			name:           "internal",
			err:            domainerrors.Internal("operation", nil),
			expectedStatus: http.StatusInternalServerError,
			expectedCode:   domainerrors.CodeInternal,
		},
		{
			name:           "timeout",
			err:            domainerrors.Timeout("operation"),
			expectedStatus: http.StatusRequestTimeout,
			expectedCode:   domainerrors.CodeTimeout,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			r := httptest.NewRequest(http.MethodGet, "/test", nil)
			ctx := requestid.WithID(context.Background(), "test-id")
			r = r.WithContext(ctx)

			response.HandleError(w, r, tt.err)

			if w.Code != tt.expectedStatus {
				t.Errorf("expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			var resp response.ErrorResponse
			if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
				t.Fatalf("failed to decode response: %v", err)
			}

			if resp.Code != string(tt.expectedCode) {
				t.Errorf("expected code %s, got %s", tt.expectedCode, resp.Code)
			}

			if resp.Success {
				t.Error("expected success to be false")
			}
		})
	}
}

func TestHandleError_NoRequestID(t *testing.T) {
	t.Parallel()

	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodGet, "/api/v1/test", nil)
	// No request ID in context

	err := domainerrors.NotFound("resource", "id")

	response.HandleError(w, r, err)

	if w.Code != http.StatusNotFound {
		t.Errorf("expected status %d, got %d", http.StatusNotFound, w.Code)
	}

	var resp response.ErrorResponse
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	// Should still work, just with empty request ID
	if resp.Code != string(domainerrors.CodeNotFound) {
		t.Errorf("expected code %s, got %s", domainerrors.CodeNotFound, resp.Code)
	}
}
