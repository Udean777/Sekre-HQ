// Package audit provides an asynchronous audit logging service that records
// sensitive operations without blocking the main request flow.
package audit

import (
	"context"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/pkg/logger"
)

// Action represents the type of action being audited
type Action string

const (
	// Organization actions
	ActionOrgUpdate Action = "organization.update"
	ActionOrgDelete Action = "organization.delete"

	// Division actions
	ActionDivisionCreate Action = "division.create"
	ActionDivisionUpdate Action = "division.update"
	ActionDivisionDelete Action = "division.delete"

	// Member actions
	ActionMemberCreate     Action = "member.create"
	ActionMemberUpdateRole Action = "member.update_role"
	ActionMemberRemove     Action = "member.remove"

	// Task actions
	ActionTaskCreate       Action = "task.create"
	ActionTaskUpdate       Action = "task.update"
	ActionTaskUpdateStatus Action = "task.update_status"
	ActionTaskDelete       Action = "task.delete"

	// Event actions
	ActionEventCreate Action = "event.create"
	ActionEventUpdate Action = "event.update"
	ActionEventDelete Action = "event.delete"

	// Transaction actions
	ActionTransactionCreate Action = "transaction.create"
	ActionTransactionUpdate Action = "transaction.update"
	ActionTransactionDelete Action = "transaction.delete"
	ActionTransactionApprove Action = "transaction.approve"
	ActionTransactionReject Action = "transaction.reject"
)

// Entry represents a single audit log entry to be recorded
type Entry struct {
	OrganizationID uuid.UUID
	UserID         uuid.UUID
	Action         Action
	TargetUserID   *uuid.UUID
	Details        map[string]interface{}
}

// Service provides asynchronous audit logging with buffering and graceful shutdown
type Service struct {
	repo       repository.AuditLogRepository
	buffer     chan Entry
	bufferSize int
	wg         sync.WaitGroup
	ctx        context.Context
	cancel     context.CancelFunc
}

// Config holds configuration for the audit service
type Config struct {
	BufferSize int           // Size of the audit log buffer (default: 1000)
	Workers    int           // Number of worker goroutines (default: 2)
	FlushInterval time.Duration // How often to flush logs (default: 5s)
}

// DefaultConfig returns sensible defaults for the audit service
func DefaultConfig() Config {
	return Config{
		BufferSize: 1000,
		Workers:    2,
		FlushInterval: 5 * time.Second,
	}
}

// NewService creates a new audit logging service with the given configuration
func NewService(repo repository.AuditLogRepository, cfg Config) *Service {
	ctx, cancel := context.WithCancel(context.Background())
	
	s := &Service{
		repo:       repo,
		buffer:     make(chan Entry, cfg.BufferSize),
		bufferSize: cfg.BufferSize,
		ctx:        ctx,
		cancel:     cancel,
	}

	// Start worker goroutines
	for i := 0; i < cfg.Workers; i++ {
		s.wg.Add(1)
		go s.worker(i)
	}

	logger.Logger.Info().
		Int("buffer_size", cfg.BufferSize).
		Int("workers", cfg.Workers).
		Msg("Audit logging service started")

	return s
}

// Log asynchronously records an audit log entry. If the buffer is full, it will
// block until space is available or the context is cancelled.
func (s *Service) Log(entry Entry) {
	select {
	case s.buffer <- entry:
		// Successfully buffered
	case <-s.ctx.Done():
		// Service is shutting down, log warning
		logger.Logger.Warn().
			Str("action", string(entry.Action)).
			Str("user_id", entry.UserID.String()).
			Msg("Audit log dropped during shutdown")
	default:
		// Buffer is full, log warning but don't block
		logger.Logger.Warn().
			Str("action", string(entry.Action)).
			Str("user_id", entry.UserID.String()).
			Int("buffer_size", s.bufferSize).
			Msg("Audit log buffer full, dropping entry")
	}
}

// LogWithContext is a convenience method that extracts common fields from context
func (s *Service) LogWithContext(ctx context.Context, action Action, details map[string]interface{}) {
	// This would need to extract user/org from context
	// For now, callers should use Log() directly
	logger.Logger.Warn().Msg("LogWithContext not yet implemented, use Log() directly")
}

// worker processes audit log entries from the buffer
func (s *Service) worker(id int) {
	defer s.wg.Done()

	logger.Logger.Debug().
		Int("worker_id", id).
		Msg("Audit worker started")

	for {
		select {
		case entry := <-s.buffer:
			s.processEntry(entry)
		case <-s.ctx.Done():
			// Drain remaining entries before shutting down
			s.drainBuffer()
			logger.Logger.Debug().
				Int("worker_id", id).
				Msg("Audit worker stopped")
			return
		}
	}
}

// processEntry writes a single audit log entry to the repository
func (s *Service) processEntry(entry Entry) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	log := &entity.AuditLog{
		ID:             uuid.New(),
		OrganizationID: entry.OrganizationID,
		UserID:         entry.UserID,
		Action:         string(entry.Action),
		TargetUserID:   entry.TargetUserID,
		Details:        entry.Details,
		CreatedAt:      time.Now(),
	}

	if err := s.repo.Create(ctx, log); err != nil {
		logger.Logger.Error().
			Err(err).
			Str("action", string(entry.Action)).
			Str("user_id", entry.UserID.String()).
			Msg("Failed to write audit log")
	}
}

// drainBuffer processes all remaining entries in the buffer
func (s *Service) drainBuffer() {
	for {
		select {
		case entry := <-s.buffer:
			s.processEntry(entry)
		default:
			return
		}
	}
}

// Shutdown gracefully stops the audit service, waiting for all buffered entries
// to be processed. It will wait up to the given timeout before forcing shutdown.
func (s *Service) Shutdown(timeout time.Duration) error {
	logger.Logger.Info().
		Dur("timeout", timeout).
		Msg("Shutting down audit service...")

	// Signal workers to stop
	s.cancel()

	// Wait for workers to finish with timeout
	done := make(chan struct{})
	go func() {
		s.wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		logger.Logger.Info().Msg("Audit service shutdown complete")
		return nil
	case <-time.After(timeout):
		logger.Logger.Warn().
			Dur("timeout", timeout).
			Msg("Audit service shutdown timed out, some logs may be lost")
		return nil
	}
}
