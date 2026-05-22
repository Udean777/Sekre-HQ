package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

// Note: These tests may trigger race detector warnings when using httptest.ResponseRecorder
// with timeout middleware. This is a known limitation of testing timeout behavior with
// httptest, not a production issue. The races occur because:
// 1. The timeout handler writes a 408 response
// 2. The actual handler may still be running and try to write
// 3. httptest.ResponseRecorder is not designed for concurrent writes
//
// In production, http.ResponseWriter implementations handle this correctly.
// See: https://github.com/golang/go/issues/31259

func TestTimeout_HandlerCompletesBeforeTimeout(t *testing.T) {
	// Handler that completes quickly
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("success"))
	})

	// Wrap with timeout middleware (1 second)
	middleware := Timeout(1 * time.Second)
	wrappedHandler := middleware(handler)

	// Create test request
	req := httptest.NewRequest("GET", "/test", nil)
	rec := httptest.NewRecorder()

	// Execute
	wrappedHandler.ServeHTTP(rec, req)

	// Verify success response
	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}
	if rec.Body.String() != "success" {
		t.Errorf("Expected body 'success', got '%s'", rec.Body.String())
	}
}

func TestTimeout_HandlerExceedsTimeout(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping timeout test in short mode (causes race with httptest.ResponseRecorder)")
	}

	// Handler that takes too long
	handlerDone := make(chan struct{})
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer close(handlerDone)
		// Simulate slow operation
		time.Sleep(200 * time.Millisecond)
		// Check if context is cancelled before writing
		select {
		case <-r.Context().Done():
			// Context cancelled, don't write to response
			return
		default:
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte("should not reach here"))
		}
	})

	// Wrap with very short timeout (50ms)
	middleware := Timeout(50 * time.Millisecond)
	wrappedHandler := middleware(handler)

	// Create test request
	req := httptest.NewRequest("GET", "/test", nil)
	rec := httptest.NewRecorder()

	// Execute
	wrappedHandler.ServeHTTP(rec, req)

	// Wait for handler goroutine to finish to avoid race
	<-handlerDone

	// Verify timeout response (408)
	if rec.Code != http.StatusRequestTimeout {
		t.Errorf("Expected status 408 (Request Timeout), got %d", rec.Code)
	}

	// Verify error response contains timeout message
	body := rec.Body.String()
	if body == "" {
		t.Error("Expected error response body, got empty")
	}
}

func TestTimeout_ContextPropagation(t *testing.T) {
	// Handler that checks context
	var ctxErr error
	done := make(chan struct{})
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Wait for context to be cancelled
		<-r.Context().Done()
		ctxErr = r.Context().Err()
		close(done)
		// Don't write to response after timeout - causes race
	})

	// Wrap with short timeout
	middleware := Timeout(50 * time.Millisecond)
	wrappedHandler := middleware(handler)

	// Create test request
	req := httptest.NewRequest("GET", "/test", nil)
	rec := httptest.NewRecorder()

	// Execute
	wrappedHandler.ServeHTTP(rec, req)

	// Wait for handler to finish
	<-done

	// Verify context was cancelled with DeadlineExceeded
	if ctxErr != context.DeadlineExceeded {
		t.Errorf("Expected context.DeadlineExceeded, got %v", ctxErr)
	}
}

func TestTimeout_LongTimeout(t *testing.T) {
	// Handler that completes quickly
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("success"))
	})

	// Wrap with very long timeout (1 hour)
	middleware := Timeout(1 * time.Hour)
	wrappedHandler := middleware(handler)

	// Create test request
	req := httptest.NewRequest("GET", "/test", nil)
	rec := httptest.NewRecorder()

	// Execute
	wrappedHandler.ServeHTTP(rec, req)

	// Should complete successfully
	if rec.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", rec.Code)
	}
}
