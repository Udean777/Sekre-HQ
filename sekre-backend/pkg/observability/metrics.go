// Package observability provides metrics, tracing, and health check infrastructure.
package observability

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

// Metrics holds all Prometheus metrics for the application.
// Use NewMetrics to construct an instance with proper registration.
type Metrics struct {
	HTTPRequestsTotal   *prometheus.CounterVec
	HTTPRequestDuration *prometheus.HistogramVec
	HTTPInFlight        *prometheus.GaugeVec
	HTTPRequestSize     *prometheus.HistogramVec
	HTTPResponseSize    *prometheus.HistogramVec
}

// NewMetrics creates and registers application metrics with the given registry.
// Pass prometheus.DefaultRegisterer for global metrics, or a custom registry
// for testing.
func NewMetrics(registry prometheus.Registerer) *Metrics {
	factory := promauto.With(registry)

	return &Metrics{
		HTTPRequestsTotal: factory.NewCounterVec(
			prometheus.CounterOpts{
				Name: "http_requests_total",
				Help: "Total number of HTTP requests, partitioned by method, path, and status code.",
			},
			[]string{"method", "path", "status"},
		),
		HTTPRequestDuration: factory.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "http_request_duration_seconds",
				Help:    "HTTP request latency in seconds, partitioned by method and path.",
				Buckets: []float64{0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10},
			},
			[]string{"method", "path"},
		),
		HTTPInFlight: factory.NewGaugeVec(
			prometheus.GaugeOpts{
				Name: "http_requests_in_flight",
				Help: "Current number of HTTP requests being processed.",
			},
			[]string{"method"},
		),
		HTTPRequestSize: factory.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "http_request_size_bytes",
				Help:    "HTTP request size in bytes.",
				Buckets: prometheus.ExponentialBuckets(64, 4, 8),
			},
			[]string{"method", "path"},
		),
		HTTPResponseSize: factory.NewHistogramVec(
			prometheus.HistogramOpts{
				Name:    "http_response_size_bytes",
				Help:    "HTTP response size in bytes.",
				Buckets: prometheus.ExponentialBuckets(64, 4, 8),
			},
			[]string{"method", "path"},
		),
	}
}

// DefaultMetrics returns metrics registered with prometheus.DefaultRegisterer.
// Use this for production. For tests, use NewMetrics with a custom registry.
var defaultMetrics *Metrics

// Default returns the default metrics instance, initializing it on first call.
// Subsequent calls return the same instance.
func Default() *Metrics {
	if defaultMetrics == nil {
		defaultMetrics = NewMetrics(prometheus.DefaultRegisterer)
	}
	return defaultMetrics
}
