package jobs

import (
	"fmt"
	"net/http"
	"time"

	"github.com/username/sekre-backend/pkg/logger"
)

// PingJob sends a GET request to the health endpoint to prevent
// Render free tier from spinning down the service after 15 minutes of inactivity.
type PingJob struct {
	healthURL string
	client    *http.Client
}

// NewPingJob creates a new PingJob.
// healthURL should be the full URL to the /health endpoint,
// e.g. https://sekre-backend.onrender.com/health
func NewPingJob(healthURL string) *PingJob {
	return &PingJob{
		healthURL: healthURL,
		client: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// Ping sends a GET request to the health endpoint.
// Scheduled: every 14 minutes (just under Render's 15-minute idle threshold).
func (j *PingJob) Ping() {
	if j.healthURL == "" {
		logger.Logger.Debug().Msg("scheduler: ping skipped — SELF_PING_URL not set")
		return
	}

	resp, err := j.client.Get(j.healthURL)
	if err != nil {
		logger.Logger.Warn().
			Err(err).
			Str("url", j.healthURL).
			Msg("scheduler: self-ping failed")
		return
	}
	defer resp.Body.Close() //nolint:errcheck

	if resp.StatusCode != http.StatusOK {
		logger.Logger.Warn().
			Str("url", j.healthURL).
			Str("status", fmt.Sprintf("%d", resp.StatusCode)).
			Msg("scheduler: self-ping returned non-200")
		return
	}

	logger.Logger.Debug().
		Str("url", j.healthURL).
		Msg("scheduler: self-ping ok")
}
