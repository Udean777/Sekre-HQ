package middleware

import (
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

// RateLimitConfig configures the rate limiter middleware.
type RateLimitConfig struct {
	// RequestsPerSecond is the steady-state rate (e.g., 10 = 10 requests/sec)
	RequestsPerSecond float64

	// Burst is the maximum number of requests allowed in a short burst
	Burst int

	// CleanupInterval is how often to remove stale per-key limiters
	// to prevent memory growth. Default: 5 minutes.
	CleanupInterval time.Duration

	// MaxIdleTime is how long a limiter must be unused before cleanup.
	// Default: 10 minutes.
	MaxIdleTime time.Duration

	// KeyFunc extracts the rate limit key from a request.
	// Default: client IP address.
	KeyFunc func(r *http.Request) string
}

// DefaultRateLimitConfig returns a sensible default for general API use.
func DefaultRateLimitConfig() RateLimitConfig {
	return RateLimitConfig{
		RequestsPerSecond: 10,
		Burst:             20,
		CleanupInterval:   5 * time.Minute,
		MaxIdleTime:       10 * time.Minute,
		KeyFunc:           ClientIPKey,
	}
}

// AuthRateLimitConfig returns a stricter rate limit for auth endpoints
// (login, register, password reset). Lower limits prevent brute force.
func AuthRateLimitConfig() RateLimitConfig {
	return RateLimitConfig{
		RequestsPerSecond: 1,    // 1 request/second sustained
		Burst:             5,    // Allow 5 quick attempts
		CleanupInterval:   5 * time.Minute,
		MaxIdleTime:       10 * time.Minute,
		KeyFunc:           ClientIPKey,
	}
}

// BulkImportRateLimitConfig returns a very strict rate limit for bulk import
// endpoints to prevent abuse and resource exhaustion.
func BulkImportRateLimitConfig() RateLimitConfig {
	return RateLimitConfig{
		RequestsPerSecond: 0.0167, // 1 request per minute (1/60)
		Burst:             1,       // No burst allowed
		CleanupInterval:   5 * time.Minute,
		MaxIdleTime:       10 * time.Minute,
		KeyFunc:           ClientIPKey,
	}
}

// limiterEntry tracks a per-key rate limiter and its last access time.
type limiterEntry struct {
	limiter  *rate.Limiter
	lastUsed time.Time
}

// rateLimiter holds per-key limiters with cleanup goroutine.
type rateLimiter struct {
	mu       sync.Mutex
	limiters map[string]*limiterEntry
	rps      rate.Limit
	burst    int
}

// newRateLimiter creates a rate limiter store and starts the cleanup goroutine.
func newRateLimiter(cfg RateLimitConfig) *rateLimiter {
	rl := &rateLimiter{
		limiters: make(map[string]*limiterEntry),
		rps:      rate.Limit(cfg.RequestsPerSecond),
		burst:    cfg.Burst,
	}

	// Start cleanup goroutine if cleanup is enabled
	if cfg.CleanupInterval > 0 {
		go rl.cleanup(cfg.CleanupInterval, cfg.MaxIdleTime)
	}

	return rl
}

// allow returns true if the key is within the rate limit.
func (rl *rateLimiter) allow(key string) bool {
	rl.mu.Lock()
	entry, ok := rl.limiters[key]
	if !ok {
		entry = &limiterEntry{
			limiter: rate.NewLimiter(rl.rps, rl.burst),
		}
		rl.limiters[key] = entry
	}
	entry.lastUsed = time.Now()
	rl.mu.Unlock()

	return entry.limiter.Allow()
}

// cleanup periodically removes idle limiters to prevent memory growth.
func (rl *rateLimiter) cleanup(interval, maxIdle time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for range ticker.C {
		now := time.Now()
		rl.mu.Lock()
		for key, entry := range rl.limiters {
			if now.Sub(entry.lastUsed) > maxIdle {
				delete(rl.limiters, key)
			}
		}
		rl.mu.Unlock()
	}
}

// RateLimit returns a middleware that limits requests per key (default: IP).
//
// On rate limit exceeded, returns 429 Too Many Requests with a domain error.
//
// The middleware uses a token-bucket algorithm via golang.org/x/time/rate.
// Per-key limiters are stored in memory; not suitable for multi-instance
// deployments without sticky sessions or a shared store (e.g., Redis).
//
// Example usage:
//
//	// Global rate limit
//	router.Use(middleware.RateLimit(middleware.DefaultRateLimitConfig()))
//
//	// Stricter limit for auth endpoints
//	authRouter := router.PathPrefix("/auth").Subrouter()
//	authRouter.Use(middleware.RateLimit(middleware.AuthRateLimitConfig()))
func RateLimit(cfg RateLimitConfig) func(http.Handler) http.Handler {
	if cfg.KeyFunc == nil {
		cfg.KeyFunc = ClientIPKey
	}

	rl := newRateLimiter(cfg)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			key := cfg.KeyFunc(r)

			if !rl.allow(key) {
				w.Header().Set("Retry-After", "1")
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusTooManyRequests)
				_, _ = w.Write([]byte(`{"success":false,"error":"rate limit exceeded","code":"RATE_LIMITED","retry_after_seconds":1}`))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// ClientIPKey extracts the client IP from the request for rate limiting.
// Honors X-Forwarded-For (first IP) and X-Real-IP headers when present,
// falling back to RemoteAddr.
//
// WARNING: Trust these headers only when behind a trusted reverse proxy
// (load balancer, CDN). Otherwise, clients can spoof their IP.
func ClientIPKey(r *http.Request) string {
	// Check X-Forwarded-For (most common, set by load balancers)
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		// X-Forwarded-For: client, proxy1, proxy2 - first is original client
		if idx := strings.Index(xff, ","); idx != -1 {
			return strings.TrimSpace(xff[:idx])
		}
		return strings.TrimSpace(xff)
	}

	// Check X-Real-IP (set by nginx)
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return xri
	}

	// Fall back to RemoteAddr (host:port format)
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}
