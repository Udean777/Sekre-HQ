package middleware

import (
	"net/http"
	"net/http/httptest"
	"sync/atomic"
	"testing"
	"time"
)

func TestRateLimit_AllowsWithinLimit(t *testing.T) {
	t.Parallel()

	cfg := RateLimitConfig{
		RequestsPerSecond: 10,
		Burst:             5,
	}

	var nextCallCount int32
	handler := RateLimit(cfg)(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		atomic.AddInt32(&nextCallCount, 1)
		w.WriteHeader(http.StatusOK)
	}))

	// Make 5 requests rapidly (within burst)
	for i := 0; i < 5; i++ {
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		req.RemoteAddr = "10.0.0.1:1234"
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, req)

		if w.Code != http.StatusOK {
			t.Errorf("request %d: status = %d, want %d", i+1, w.Code, http.StatusOK)
		}
	}

	if got := atomic.LoadInt32(&nextCallCount); got != 5 {
		t.Errorf("next called %d times, want 5", got)
	}
}

func TestRateLimit_BlocksExceedingLimit(t *testing.T) {
	t.Parallel()

	cfg := RateLimitConfig{
		RequestsPerSecond: 1,
		Burst:             2,
	}

	var blockedCount int32
	handler := RateLimit(cfg)(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// Burst (2) + extra requests should be blocked
	for i := 0; i < 10; i++ {
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		req.RemoteAddr = "10.0.0.2:1234"
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, req)

		if w.Code == http.StatusTooManyRequests {
			atomic.AddInt32(&blockedCount, 1)
		}
	}

	if got := atomic.LoadInt32(&blockedCount); got < 5 {
		t.Errorf("blocked count = %d, want at least 5", got)
	}
}

func TestRateLimit_PerKeyIsolation(t *testing.T) {
	t.Parallel()

	cfg := RateLimitConfig{
		RequestsPerSecond: 1,
		Burst:             2,
	}

	handler := RateLimit(cfg)(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// Client A: exhaust the limit
	for i := 0; i < 5; i++ {
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		req.RemoteAddr = "10.0.0.10:1234"
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, req)
	}

	// Client B: should still be allowed (different key)
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.RemoteAddr = "10.0.0.11:5678"
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("client B status = %d, want %d (per-key isolation broken)", w.Code, http.StatusOK)
	}
}

func TestRateLimit_RetryAfterHeader(t *testing.T) {
	t.Parallel()

	cfg := RateLimitConfig{
		RequestsPerSecond: 1,
		Burst:             1,
	}

	handler := RateLimit(cfg)(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// Exhaust limit
	for i := 0; i < 2; i++ {
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		req.RemoteAddr = "10.0.0.20:1234"
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, req)
	}

	// Next request should be blocked with Retry-After
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.RemoteAddr = "10.0.0.20:1234"
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if w.Code != http.StatusTooManyRequests {
		t.Errorf("status = %d, want %d", w.Code, http.StatusTooManyRequests)
	}
	if got := w.Header().Get("Retry-After"); got == "" {
		t.Error("Retry-After header should be set")
	}
}

func TestClientIPKey_RemoteAddr(t *testing.T) {
	t.Parallel()

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.RemoteAddr = "10.0.0.1:1234"

	if got := ClientIPKey(req); got != "10.0.0.1" {
		t.Errorf("ClientIPKey = %q, want %q", got, "10.0.0.1")
	}
}

func TestClientIPKey_XForwardedFor(t *testing.T) {
	t.Parallel()

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.RemoteAddr = "10.0.0.1:1234"
	req.Header.Set("X-Forwarded-For", "203.0.113.10, 10.0.0.5, 10.0.0.6")

	if got := ClientIPKey(req); got != "203.0.113.10" {
		t.Errorf("ClientIPKey = %q, want %q", got, "203.0.113.10")
	}
}

func TestClientIPKey_XRealIP(t *testing.T) {
	t.Parallel()

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.RemoteAddr = "10.0.0.1:1234"
	req.Header.Set("X-Real-IP", "203.0.113.20")

	if got := ClientIPKey(req); got != "203.0.113.20" {
		t.Errorf("ClientIPKey = %q, want %q", got, "203.0.113.20")
	}
}

func TestRateLimit_CustomKeyFunc(t *testing.T) {
	t.Parallel()

	cfg := RateLimitConfig{
		RequestsPerSecond: 1,
		Burst:             1,
		KeyFunc: func(r *http.Request) string {
			return r.Header.Get("X-User-ID")
		},
	}

	handler := RateLimit(cfg)(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	// User A: exhaust limit
	for i := 0; i < 3; i++ {
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		req.Header.Set("X-User-ID", "user-a")
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, req)
	}

	// User B: should still be allowed
	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	req.Header.Set("X-User-ID", "user-b")
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("user B status = %d, want %d", w.Code, http.StatusOK)
	}
}

func TestDefaultConfigs(t *testing.T) {
	t.Parallel()

	def := DefaultRateLimitConfig()
	if def.RequestsPerSecond <= 0 {
		t.Error("DefaultRateLimitConfig should have positive RPS")
	}
	if def.Burst <= 0 {
		t.Error("DefaultRateLimitConfig should have positive Burst")
	}

	auth := AuthRateLimitConfig()
	if auth.RequestsPerSecond > def.RequestsPerSecond {
		t.Error("AuthRateLimitConfig should be stricter than default")
	}
}

func TestRateLimit_RecoverAfterTime(t *testing.T) {
	t.Parallel()

	// Use slightly higher rate so recovery happens quickly in test
	cfg := RateLimitConfig{
		RequestsPerSecond: 100, // very fast recovery
		Burst:             1,
	}

	handler := RateLimit(cfg)(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	makeReq := func() int {
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		req.RemoteAddr = "10.0.0.30:1234"
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, req)
		return w.Code
	}

	// First should pass
	if code := makeReq(); code != http.StatusOK {
		t.Errorf("first request: %d, want %d", code, http.StatusOK)
	}

	// Wait for token refill (100 rps = 10ms per token)
	time.Sleep(20 * time.Millisecond)

	// Should pass again
	if code := makeReq(); code != http.StatusOK {
		t.Errorf("after wait: %d, want %d (token should have refilled)", code, http.StatusOK)
	}
}
