package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestSecurityHeaders_DefaultConfig(t *testing.T) {
	t.Parallel()

	cfg := DefaultSecurityHeadersConfig()
	handler := SecurityHeaders(cfg)(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	tests := []struct {
		header string
		want   string
	}{
		{"X-Content-Type-Options", "nosniff"},
		{"X-Frame-Options", "DENY"},
		{"Referrer-Policy", "strict-origin-when-cross-origin"},
		{"Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'"},
	}

	for _, tt := range tests {
		if got := w.Header().Get(tt.header); got != tt.want {
			t.Errorf("%s = %q, want %q", tt.header, got, tt.want)
		}
	}

	// HSTS should NOT be set in default config
	if got := w.Header().Get("Strict-Transport-Security"); got != "" {
		t.Errorf("Strict-Transport-Security = %q, want empty in default config", got)
	}
}

func TestSecurityHeaders_ProductionConfig(t *testing.T) {
	t.Parallel()

	cfg := ProductionSecurityHeadersConfig()
	handler := SecurityHeaders(cfg)(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	// HSTS should be set in production config
	hsts := w.Header().Get("Strict-Transport-Security")
	if hsts == "" {
		t.Error("Strict-Transport-Security should be set in production config")
	}
	if hsts != "max-age=63072000; includeSubDomains" {
		t.Errorf("Strict-Transport-Security = %q", hsts)
	}
}

func TestSecurityHeaders_EmptyFieldsOmitted(t *testing.T) {
	t.Parallel()

	// Config with only some fields set
	cfg := SecurityHeadersConfig{
		XContentTypeOptions: "nosniff",
		// All others empty
	}

	handler := SecurityHeaders(cfg)(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	// Set header should be present
	if got := w.Header().Get("X-Content-Type-Options"); got != "nosniff" {
		t.Errorf("X-Content-Type-Options = %q, want nosniff", got)
	}

	// Unset headers should NOT be present
	unsetHeaders := []string{
		"X-Frame-Options",
		"Referrer-Policy",
		"Strict-Transport-Security",
		"Content-Security-Policy",
		"Permissions-Policy",
	}

	for _, h := range unsetHeaders {
		if got := w.Header().Get(h); got != "" {
			t.Errorf("%s = %q, want empty (field not configured)", h, got)
		}
	}
}

func TestSecurityHeaders_CallsNext(t *testing.T) {
	t.Parallel()

	nextCalled := false
	handler := SecurityHeaders(DefaultSecurityHeadersConfig())(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		nextCalled = true
		w.WriteHeader(http.StatusAccepted)
	}))

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	if !nextCalled {
		t.Error("next handler was not called")
	}

	if w.Code != http.StatusAccepted {
		t.Errorf("status = %d, want %d", w.Code, http.StatusAccepted)
	}
}

func TestSecurityHeaders_PermissionsPolicyFormat(t *testing.T) {
	t.Parallel()

	cfg := DefaultSecurityHeadersConfig()
	handler := SecurityHeaders(cfg)(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()

	handler.ServeHTTP(w, req)

	permissions := w.Header().Get("Permissions-Policy")
	expectedFeatures := []string{"geolocation", "microphone", "camera", "payment"}
	for _, feature := range expectedFeatures {
		if !contains(permissions, feature) {
			t.Errorf("Permissions-Policy should restrict %q, got %q", feature, permissions)
		}
	}
}

// helper for substring check
func contains(s, substr string) bool {
	for i := 0; i+len(substr) <= len(s); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
