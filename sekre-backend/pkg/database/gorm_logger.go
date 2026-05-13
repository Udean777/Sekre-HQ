package database

import (
	"context"
	"errors"
	"time"

	"github.com/rs/zerolog"
	"gorm.io/gorm/logger"
)

// GormZerologAdapter adapts zerolog to gorm's logger interface
type GormZerologAdapter struct {
	logger               zerolog.Logger
	slowThreshold        time.Duration
	ignoreRecordNotFound bool
	logLevel             logger.LogLevel
}

// NewGormZerologAdapter creates a new gorm logger that uses zerolog
func NewGormZerologAdapter(zlog zerolog.Logger, slowThreshold time.Duration) *GormZerologAdapter {
	return &GormZerologAdapter{
		logger:               zlog,
		slowThreshold:        slowThreshold,
		ignoreRecordNotFound: true,
		logLevel:             logger.Warn,
	}
}

// LogMode sets the log level
func (l *GormZerologAdapter) LogMode(level logger.LogLevel) logger.Interface {
	newLogger := *l
	newLogger.logLevel = level
	return &newLogger
}

// Info logs info level messages
func (l *GormZerologAdapter) Info(ctx context.Context, msg string, data ...interface{}) {
	if l.logLevel >= logger.Info {
		l.logger.Info().Msgf(msg, data...)
	}
}

// Warn logs warning level messages
func (l *GormZerologAdapter) Warn(ctx context.Context, msg string, data ...interface{}) {
	if l.logLevel >= logger.Warn {
		l.logger.Warn().Msgf(msg, data...)
	}
}

// Error logs error level messages
func (l *GormZerologAdapter) Error(ctx context.Context, msg string, data ...interface{}) {
	if l.logLevel >= logger.Error {
		l.logger.Error().Msgf(msg, data...)
	}
}

// Trace logs SQL queries with execution time
func (l *GormZerologAdapter) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {
	if l.logLevel <= logger.Silent {
		return
	}

	elapsed := time.Since(begin)
	sql, rows := fc()

	switch {
	case err != nil && l.logLevel >= logger.Error && (!errors.Is(err, logger.ErrRecordNotFound) || !l.ignoreRecordNotFound):
		// Log errors
		l.logger.Error().
			Err(err).
			Dur("elapsed", elapsed).
			Int64("rows", rows).
			Str("sql", sql).
			Msg("SQL Error")

	case elapsed > l.slowThreshold && l.slowThreshold != 0 && l.logLevel >= logger.Warn:
		// Log slow queries
		l.logger.Warn().
			Dur("elapsed", elapsed).
			Dur("threshold", l.slowThreshold).
			Int64("rows", rows).
			Str("sql", sql).
			Msg("Slow SQL Query")

	case l.logLevel >= logger.Info:
		// Log all queries at info level
		l.logger.Debug().
			Dur("elapsed", elapsed).
			Int64("rows", rows).
			Str("sql", sql).
			Msg("SQL Query")
	}
}
