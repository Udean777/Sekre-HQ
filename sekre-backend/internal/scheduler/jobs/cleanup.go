package jobs

import (
	"time"

	"github.com/username/sekre-backend/pkg/logger"
	"gorm.io/gorm"
)

// CleanupJob handles periodic cleanup of stale database records.
type CleanupJob struct {
	db                          *gorm.DB
	refreshSessionRetentionDays int
	auditLogRetentionDays       int
}

// NewCleanupJob creates a new CleanupJob.
func NewCleanupJob(db *gorm.DB, refreshSessionRetentionDays, auditLogRetentionDays int) *CleanupJob {
	return &CleanupJob{
		db:                          db,
		refreshSessionRetentionDays: refreshSessionRetentionDays,
		auditLogRetentionDays:       auditLogRetentionDays,
	}
}

// CleanupExpiredSessions deletes refresh sessions that have been expired
// longer than the configured retention period.
// Scheduled: 02:00 daily.
func (j *CleanupJob) CleanupExpiredSessions() {
	cutoff := time.Now().UTC().AddDate(0, 0, -j.refreshSessionRetentionDays)

	result := j.db.Exec(
		`DELETE FROM refresh_sessions WHERE expires_at < ?`,
		cutoff,
	)

	if result.Error != nil {
		logger.Logger.Error().
			Err(result.Error).
			Msg("scheduler: failed to cleanup expired refresh sessions")
		return
	}

	logger.Logger.Info().
		Int64("rows_deleted", result.RowsAffected).
		Int("retention_days", j.refreshSessionRetentionDays).
		Time("cutoff", cutoff).
		Msg("scheduler: cleanup expired refresh sessions completed")
}

// CleanupAuditLogs deletes audit log entries older than the configured
// retention period.
// Scheduled: 02:30 daily.
func (j *CleanupJob) CleanupAuditLogs() {
	cutoff := time.Now().UTC().AddDate(0, 0, -j.auditLogRetentionDays)

	result := j.db.Exec(
		`DELETE FROM audit_logs WHERE created_at < ?`,
		cutoff,
	)

	if result.Error != nil {
		logger.Logger.Error().
			Err(result.Error).
			Msg("scheduler: failed to cleanup audit logs")
		return
	}

	logger.Logger.Info().
		Int64("rows_deleted", result.RowsAffected).
		Int("retention_days", j.auditLogRetentionDays).
		Time("cutoff", cutoff).
		Msg("scheduler: cleanup audit logs completed")
}
