package handler

import (
	"context"
	"net/http"
	"time"

	"github.com/username/sekre-backend/pkg/response"
	"gorm.io/gorm"
)

// HealthHandler provides liveness and readiness probes.
// Liveness: "am I alive?" (process running, not deadlocked)
// Readiness: "am I ready to serve traffic?" (DB, cache, etc reachable)
type HealthHandler struct {
	db      *gorm.DB
	version string
}

// NewHealthHandler creates a new health check handler.
// version is included in responses for deployment tracking.
func NewHealthHandler(db *gorm.DB, version string) *HealthHandler {
	return &HealthHandler{db: db, version: version}
}

// Live returns 200 OK if the process is alive.
// Used by k8s liveness probe to detect deadlocks.
// Does NOT check dependencies - should never fail unless the process is broken.
func (h *HealthHandler) Live(w http.ResponseWriter, r *http.Request) {
	response.Success(w, http.StatusOK, "alive", map[string]interface{}{
		"status":  "ok",
		"version": h.version,
	})
}

// Ready returns 200 if the service is ready to serve traffic.
// Returns 503 Service Unavailable if any dependency is unreachable.
// Used by k8s readiness probe and load balancer health checks.
func (h *HealthHandler) Ready(w http.ResponseWriter, r *http.Request) {
	checks := make(map[string]interface{})
	allHealthy := true

	// Check database with timeout (don't hang readiness probe)
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()

	dbStatus := h.checkDatabase(ctx)
	checks["database"] = dbStatus
	if dbStatus["status"] != "ok" {
		allHealthy = false
	}

	payload := map[string]interface{}{
		"version": h.version,
		"checks":  checks,
	}

	if !allHealthy {
		payload["status"] = "unhealthy"
		response.JSON(w, http.StatusServiceUnavailable, payload)
		return
	}

	payload["status"] = "ok"
	response.Success(w, http.StatusOK, "ready", payload)
}

// checkDatabase pings the database and returns status info.
func (h *HealthHandler) checkDatabase(ctx context.Context) map[string]interface{} {
	sqlDB, err := h.db.DB()
	if err != nil {
		return map[string]interface{}{
			"status": "error",
			"error":  err.Error(),
		}
	}

	start := time.Now()
	if err := sqlDB.PingContext(ctx); err != nil {
		return map[string]interface{}{
			"status":    "down",
			"error":     err.Error(),
			"latency":   time.Since(start).String(),
		}
	}

	return map[string]interface{}{
		"status":  "ok",
		"latency": time.Since(start).String(),
	}
}
