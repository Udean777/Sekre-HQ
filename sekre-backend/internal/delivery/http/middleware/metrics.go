package middleware

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/username/sekre-backend/pkg/observability"
)

// metricsResponseWriter wraps http.ResponseWriter to capture status code and size.
type metricsResponseWriter struct {
	http.ResponseWriter
	statusCode int
	bytesSent  int
}

func (m *metricsResponseWriter) WriteHeader(code int) {
	m.statusCode = code
	m.ResponseWriter.WriteHeader(code)
}

func (m *metricsResponseWriter) Write(b []byte) (int, error) {
	n, err := m.ResponseWriter.Write(b)
	m.bytesSent += n
	return n, err
}

// Metrics returns a middleware that records HTTP request metrics.
//
// Metrics recorded:
//   - http_requests_total{method, path, status}
//   - http_request_duration_seconds{method, path}
//   - http_requests_in_flight{method}
//   - http_request_size_bytes{method, path}
//   - http_response_size_bytes{method, path}
//
// Path is normalized using mux route template (e.g., /tasks/{id} instead of
// /tasks/abc-123) to avoid cardinality explosion.
func Metrics(m *observability.Metrics) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Track in-flight requests
			m.HTTPInFlight.WithLabelValues(r.Method).Inc()
			defer m.HTTPInFlight.WithLabelValues(r.Method).Dec()

			// Normalize path (use route template, not actual path)
			path := routePath(r)

			// Request size (Content-Length if available)
			if r.ContentLength > 0 {
				m.HTTPRequestSize.WithLabelValues(r.Method, path).Observe(float64(r.ContentLength))
			}

			// Wrap response writer to capture status and size
			wrapped := &metricsResponseWriter{
				ResponseWriter: w,
				statusCode:     http.StatusOK,
			}

			// Record duration
			start := time.Now()
			next.ServeHTTP(wrapped, r)
			duration := time.Since(start).Seconds()

			// Record metrics
			m.HTTPRequestsTotal.WithLabelValues(
				r.Method,
				path,
				strconv.Itoa(wrapped.statusCode),
			).Inc()

			m.HTTPRequestDuration.WithLabelValues(r.Method, path).Observe(duration)

			if wrapped.bytesSent > 0 {
				m.HTTPResponseSize.WithLabelValues(r.Method, path).Observe(float64(wrapped.bytesSent))
			}
		})
	}
}

// routePath returns the normalized path for metrics labeling.
// If the request matches a mux route, returns the route template
// (e.g., "/tasks/{id}") instead of the actual path ("/tasks/abc-123").
// This prevents cardinality explosion in metrics.
func routePath(r *http.Request) string {
	if route := mux.CurrentRoute(r); route != nil {
		if tmpl, err := route.GetPathTemplate(); err == nil {
			return tmpl
		}
	}
	return r.URL.Path
}
