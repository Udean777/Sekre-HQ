package logger

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

var (
	Logger zerolog.Logger
)

// Init initializes the logger with beautiful console output
func Init() {
	InitWithLevel("info")
}

// InitWithLevel initializes the logger with specified log level
func InitWithLevel(level string) {
	// Set up console writer with colors
	output := zerolog.ConsoleWriter{
		Out:        os.Stdout,
		TimeFormat: "15:04:05",
		NoColor:    false,
		FormatLevel: func(i interface{}) string {
			var level string
			if ll, ok := i.(string); ok {
				switch ll {
				case "trace":
					level = "🔍 TRACE"
				case "debug":
					level = "🐛 DEBUG"
				case "info":
					level = "✅ INFO "
				case "warn":
					level = "⚠️  WARN "
				case "error":
					level = "❌ ERROR"
				case "fatal":
					level = "💀 FATAL"
				case "panic":
					level = "🔥 PANIC"
				default:
					level = strings.ToUpper(ll)
				}
			}
			return fmt.Sprintf("| %-12s|", level)
		},
		FormatMessage: func(i interface{}) string {
			return fmt.Sprintf("%-50s", i)
		},
		FormatFieldName: func(i interface{}) string {
			return fmt.Sprintf("%s:", i)
		},
		FormatFieldValue: func(i interface{}) string {
			return fmt.Sprintf("%s", i)
		},
		FormatTimestamp: func(i interface{}) string {
			return fmt.Sprintf("⏰ %s", i)
		},
		FormatCaller: func(i interface{}) string {
			var c string
			if cc, ok := i.(string); ok {
				c = cc
			}
			if len(c) > 0 {
				// Extract just the filename and line number
				parts := strings.Split(c, "/")
				if len(parts) > 0 {
					c = parts[len(parts)-1]
				}
				return fmt.Sprintf("📍 %s", c)
			}
			return ""
		},
	}

	// Create logger
	Logger = zerolog.New(output).
		With().
		Timestamp().
		Caller().
		Logger()

	// Set global logger
	log.Logger = Logger

	// Set log level
	setLogLevel(level)

	Logger.Info().Str("level", level).Msg("Logger initialized with beautiful console output")
}

// setLogLevel sets the global log level
func setLogLevel(level string) {
	switch strings.ToLower(level) {
	case "trace":
		zerolog.SetGlobalLevel(zerolog.TraceLevel)
	case "debug":
		zerolog.SetGlobalLevel(zerolog.DebugLevel)
	case "info":
		zerolog.SetGlobalLevel(zerolog.InfoLevel)
	case "warn", "warning":
		zerolog.SetGlobalLevel(zerolog.WarnLevel)
	case "error":
		zerolog.SetGlobalLevel(zerolog.ErrorLevel)
	case "fatal":
		zerolog.SetGlobalLevel(zerolog.FatalLevel)
	case "panic":
		zerolog.SetGlobalLevel(zerolog.PanicLevel)
	default:
		zerolog.SetGlobalLevel(zerolog.InfoLevel)
	}
}

// InitWithFile initializes logger with both console and file output
func InitWithFile(logFilePath string) error {
	return InitWithFileAndLevel(logFilePath, "info")
}

// InitWithFileAndLevel initializes logger with both console and file output and specified log level
func InitWithFileAndLevel(logFilePath string, level string) error {
	// Create log directory if not exists
	logDir := filepath.Dir(logFilePath)
	if err := os.MkdirAll(logDir, 0755); err != nil {
		return fmt.Errorf("failed to create log directory: %w", err)
	}

	// Open log file
	logFile, err := os.OpenFile(logFilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		return fmt.Errorf("failed to open log file: %w", err)
	}

	// Console writer with colors
	consoleWriter := zerolog.ConsoleWriter{
		Out:        os.Stdout,
		TimeFormat: "15:04:05",
		NoColor:    false,
		FormatLevel: func(i interface{}) string {
			var level string
			if ll, ok := i.(string); ok {
				switch ll {
				case "trace":
					level = "🔍 TRACE"
				case "debug":
					level = "🐛 DEBUG"
				case "info":
					level = "✅ INFO "
				case "warn":
					level = "⚠️  WARN "
				case "error":
					level = "❌ ERROR"
				case "fatal":
					level = "💀 FATAL"
				case "panic":
					level = "🔥 PANIC"
				default:
					level = strings.ToUpper(ll)
				}
			}
			return fmt.Sprintf("| %-12s|", level)
		},
		FormatMessage: func(i interface{}) string {
			return fmt.Sprintf("%-50s", i)
		},
		FormatTimestamp: func(i interface{}) string {
			return fmt.Sprintf("⏰ %s", i)
		},
		FormatCaller: func(i interface{}) string {
			var c string
			if cc, ok := i.(string); ok {
				c = cc
			}
			if len(c) > 0 {
				parts := strings.Split(c, "/")
				if len(parts) > 0 {
					c = parts[len(parts)-1]
				}
				return fmt.Sprintf("📍 %s", c)
			}
			return ""
		},
	}

	// Multi writer (console + file)
	multi := io.MultiWriter(consoleWriter, logFile)

	// Create logger
	Logger = zerolog.New(multi).
		With().
		Timestamp().
		Caller().
		Logger()

	// Set global logger
	log.Logger = Logger

	// Set log level
	setLogLevel(level)

	Logger.Info().Str("log_file", logFilePath).Str("level", level).Msg("Logger initialized with file output")
	return nil
}

// Info logs an info message
func Info(msg string) {
	Logger.Info().Msg(msg)
}

// Infof logs a formatted info message
func Infof(format string, args ...interface{}) {
	Logger.Info().Msgf(format, args...)
}

// Debug logs a debug message
func Debug(msg string) {
	Logger.Debug().Msg(msg)
}

// Debugf logs a formatted debug message
func Debugf(format string, args ...interface{}) {
	Logger.Debug().Msgf(format, args...)
}

// Warn logs a warning message
func Warn(msg string) {
	Logger.Warn().Msg(msg)
}

// Warnf logs a formatted warning message
func Warnf(format string, args ...interface{}) {
	Logger.Warn().Msgf(format, args...)
}

// Error logs an error message
func Error(msg string) {
	Logger.Error().Msg(msg)
}

// Errorf logs a formatted error message
func Errorf(format string, args ...interface{}) {
	Logger.Error().Msgf(format, args...)
}

// ErrorWithErr logs an error with error object
func ErrorWithErr(err error, msg string) {
	Logger.Error().Err(err).Msg(msg)
}

// Fatal logs a fatal message and exits
func Fatal(msg string) {
	Logger.Fatal().Msg(msg)
}

// Fatalf logs a formatted fatal message and exits
func Fatalf(format string, args ...interface{}) {
	Logger.Fatal().Msgf(format, args...)
}

// WithFields returns a logger with additional fields
func WithFields(fields map[string]interface{}) zerolog.Logger {
	ctx := Logger.With()
	for k, v := range fields {
		ctx = ctx.Interface(k, v)
	}
	return ctx.Logger()
}

// HTTPRequest logs HTTP request details
func HTTPRequest(method, path string, statusCode int, duration time.Duration, ip string) {
	var level zerolog.Level
	switch {
	case statusCode >= 500:
		level = zerolog.ErrorLevel
	case statusCode >= 400:
		level = zerolog.WarnLevel
	default:
		level = zerolog.InfoLevel
	}

	Logger.WithLevel(level).
		Str("method", method).
		Str("path", path).
		Int("status", statusCode).
		Dur("duration", duration).
		Str("ip", ip).
		Msg("HTTP Request")
}

// DatabaseQuery logs database query details
func DatabaseQuery(query string, duration time.Duration, err error) {
	if err != nil {
		Logger.Error().
			Err(err).
			Str("query", query).
			Dur("duration", duration).
			Msg("Database Query Failed")
	} else if duration > 200*time.Millisecond {
		Logger.Warn().
			Str("query", query).
			Dur("duration", duration).
			Msg("Slow Database Query")
	} else {
		Logger.Debug().
			Str("query", query).
			Dur("duration", duration).
			Msg("Database Query")
	}
}
