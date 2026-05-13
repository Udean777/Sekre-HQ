package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/testutil"
	"github.com/username/sekre-backend/pkg/observability"
)

func TestMetrics_RequestsCounted(t *testing.T) {
	t.Parallel()

	registry := prometheus.NewRegistry()
	metrics := observability.NewMetrics(registry)

	router := mux.NewRouter()
	router.Use(Metrics(metrics))
	router.HandleFunc("/test", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	// Make 3 requests
	for i := 0; i < 3; i++ {
		req := httptest.NewRequest(http.MethodGet, "/test", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
	}

	// Verify counter
	count := testutil.ToFloat64(metrics.HTTPRequestsTotal.WithLabelValues("GET", "/test", "200"))
	if count != 3 {
		t.Errorf("HTTPRequestsTotal = %f, want 3", count)
	}
}

func TestMetrics_StatusCodeCaptured(t *testing.T) {
	t.Parallel()

	registry := prometheus.NewRegistry()
	metrics := observability.NewMetrics(registry)

	router := mux.NewRouter()
	router.Use(Metrics(metrics))
	router.HandleFunc("/error", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	})

	req := httptest.NewRequest(http.MethodPost, "/error", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	count := testutil.ToFloat64(metrics.HTTPRequestsTotal.WithLabelValues("POST", "/error", "500"))
	if count != 1 {
		t.Errorf("HTTPRequestsTotal[500] = %f, want 1", count)
	}
}

func TestMetrics_RouteTemplateNormalized(t *testing.T) {
	t.Parallel()

	registry := prometheus.NewRegistry()
	metrics := observability.NewMetrics(registry)

	router := mux.NewRouter()
	router.Use(Metrics(metrics))
	router.HandleFunc("/tasks/{id}", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Multiple requests with different IDs - should normalize to /tasks/{id}
	ids := []string{"abc", "def", "xyz"}
	for _, id := range ids {
		req := httptest.NewRequest(http.MethodGet, "/tasks/"+id, nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)
	}

	// Should be 3 requests on the SAME path label (not 3 different paths)
	count := testutil.ToFloat64(metrics.HTTPRequestsTotal.WithLabelValues("GET", "/tasks/{id}", "200"))
	if count != 3 {
		t.Errorf("HTTPRequestsTotal[/tasks/{id}] = %f, want 3", count)
	}
}

func TestMetrics_DurationRecorded(t *testing.T) {
	t.Parallel()

	registry := prometheus.NewRegistry()
	metrics := observability.NewMetrics(registry)

	router := mux.NewRouter()
	router.Use(Metrics(metrics))
	router.HandleFunc("/test", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Get histogram count
	count := testutil.CollectAndCount(metrics.HTTPRequestDuration)
	if count == 0 {
		t.Error("HTTPRequestDuration should have at least one observation")
	}
}

func TestMetrics_PrometheusOutputFormat(t *testing.T) {
	t.Parallel()

	registry := prometheus.NewRegistry()
	metrics := observability.NewMetrics(registry)

	router := mux.NewRouter()
	router.Use(Metrics(metrics))
	router.HandleFunc("/api/test", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/api/test", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// Verify metrics can be gathered (no registration errors)
	gathered, err := registry.Gather()
	if err != nil {
		t.Fatalf("failed to gather metrics: %v", err)
	}

	// Should have the http_requests_total metric
	found := false
	for _, mf := range gathered {
		if strings.Contains(mf.GetName(), "http_requests_total") {
			found = true
			break
		}
	}
	if !found {
		t.Error("http_requests_total metric not found in registry")
	}
}
