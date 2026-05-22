package scheduler

import (
	"github.com/robfig/cron/v3"
	"github.com/username/sekre-backend/internal/config"
	"github.com/username/sekre-backend/internal/scheduler/jobs"
	"github.com/username/sekre-backend/pkg/logger"
	"gorm.io/gorm"
)

// Scheduler wraps robfig/cron and manages all background jobs.
type Scheduler struct {
	cron *cron.Cron
}

// New creates and registers all background jobs.
// Call Start() to begin execution.
func New(db *gorm.DB, cfg config.SchedulerConfig) *Scheduler {
	c := cron.New(cron.WithSeconds())

	cleanup := jobs.NewCleanupJob(
		db,
		cfg.RefreshSessionRetentionDays,
		cfg.AuditLogRetentionDays,
	)

	// Cleanup expired refresh sessions — every day at 02:00
	if _, err := c.AddFunc("0 0 2 * * *", cleanup.CleanupExpiredSessions); err != nil {
		logger.Logger.Error().Err(err).Msg("scheduler: failed to register CleanupExpiredSessions job")
	} else {
		logger.Logger.Info().Msg("scheduler: registered CleanupExpiredSessions (daily 02:00)")
	}

	// Cleanup old audit logs — every day at 02:30
	if _, err := c.AddFunc("0 30 2 * * *", cleanup.CleanupAuditLogs); err != nil {
		logger.Logger.Error().Err(err).Msg("scheduler: failed to register CleanupAuditLogs job")
	} else {
		logger.Logger.Info().Msg("scheduler: registered CleanupAuditLogs (daily 02:30)")
	}

	// Self-ping to prevent Render free tier from spinning down (every 14 minutes)
	ping := jobs.NewPingJob(cfg.SelfPingURL)
	if _, err := c.AddFunc("0 */14 * * * *", ping.Ping); err != nil {
		logger.Logger.Error().Err(err).Msg("scheduler: failed to register Ping job")
	} else {
		if cfg.SelfPingURL != "" {
			logger.Logger.Info().
				Str("url", cfg.SelfPingURL).
				Msg("scheduler: registered self-ping (every 14 minutes)")
		} else {
			logger.Logger.Info().Msg("scheduler: self-ping registered but SELF_PING_URL not set — will be skipped")
		}
	}

	return &Scheduler{cron: c}
}

// Start begins executing registered jobs in the background.
func (s *Scheduler) Start() {
	s.cron.Start()
	logger.Logger.Info().Msg("scheduler: started")
}

// Stop gracefully stops the scheduler, waiting for running jobs to finish.
func (s *Scheduler) Stop() {
	ctx := s.cron.Stop()
	<-ctx.Done()
	logger.Logger.Info().Msg("scheduler: stopped")
}
