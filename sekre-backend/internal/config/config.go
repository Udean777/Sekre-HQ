package config

import (
	"fmt"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	Server    ServerConfig
	Database  DatabaseConfig
	JWT       JWTConfig
	Log       LogConfig
	CORS      CORSConfig
	Scheduler SchedulerConfig
}

type SchedulerConfig struct {
	RefreshSessionRetentionDays int
	AuditLogRetentionDays       int
	SelfPingURL                 string
}

type LogConfig struct {
	Level string
}

type CORSConfig struct {
	AllowedOrigins   []string
	AllowedMethods   []string
	AllowedHeaders   []string
	ExposedHeaders   []string
	AllowCredentials bool
	MaxAge           int
}

type ServerConfig struct {
	Port            string
	Env             string
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	ShutdownTimeout time.Duration
}

type DatabaseConfig struct {
	Host            string
	Port            string
	User            string
	Password        string
	DBName          string
	SSLMode         string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
}

type JWTConfig struct {
	Secret        string
	AccessExpiry  time.Duration
	RefreshExpiry time.Duration
}

func Load() (*Config, error) {
	// Load .env file if exists
	_ = godotenv.Load()

	// Resolve database config — DATABASE_URL takes priority over individual DB_* vars
	dbCfg, err := loadDatabaseConfig()
	if err != nil {
		return nil, err
	}

	config := &Config{
		Server: ServerConfig{
			Port:            getEnv("SERVER_PORT", "8080"),
			Env:             getEnv("SERVER_ENV", "development"),
			ReadTimeout:     time.Duration(getEnvAsInt("SERVER_READ_TIMEOUT", 15)) * time.Second,
			WriteTimeout:    time.Duration(getEnvAsInt("SERVER_WRITE_TIMEOUT", 15)) * time.Second,
			ShutdownTimeout: time.Duration(getEnvAsInt("SERVER_SHUTDOWN_TIMEOUT", 30)) * time.Second,
		},
		Database: dbCfg,
		JWT: JWTConfig{
			Secret:        getEnv("JWT_SECRET", ""),
			AccessExpiry:  time.Duration(getEnvAsInt("JWT_ACCESS_EXPIRY", 15)) * time.Minute,
			RefreshExpiry: time.Duration(getEnvAsInt("JWT_REFRESH_EXPIRY", 10080)) * time.Minute, // 7 days
		},
		Log: LogConfig{
			Level: getEnv("LOG_LEVEL", "info"),
		},
		CORS: CORSConfig{
			AllowedOrigins:   getEnvAsSlice("CORS_ALLOWED_ORIGINS", []string{"http://localhost:3000", "http://localhost:5173"}),
			AllowedMethods:   getEnvAsSlice("CORS_ALLOWED_METHODS", []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}),
			AllowedHeaders:   getEnvAsSlice("CORS_ALLOWED_HEADERS", []string{"Content-Type", "Authorization", "Accept", "X-Request-ID"}),
			ExposedHeaders:   getEnvAsSlice("CORS_EXPOSED_HEADERS", []string{"X-Request-ID"}),
			AllowCredentials: getEnvAsBool("CORS_ALLOW_CREDENTIALS", true),
			MaxAge:           getEnvAsInt("CORS_MAX_AGE", 3600),
		},
		Scheduler: SchedulerConfig{
			RefreshSessionRetentionDays: getEnvAsInt("CLEANUP_REFRESH_SESSION_RETENTION_DAYS", 7),
			AuditLogRetentionDays:       getEnvAsInt("CLEANUP_AUDIT_LOG_RETENTION_DAYS", 90),
			SelfPingURL:                 getEnv("SELF_PING_URL", ""),
		},
	}

	// Validate required fields
	if config.JWT.Secret == "" {
		return nil, fmt.Errorf("JWT_SECRET is required")
	}

	if len(config.JWT.Secret) < 32 {
		return nil, fmt.Errorf("JWT_SECRET must be at least 32 characters")
	}

	// Validate log level
	validLogLevels := map[string]bool{
		"trace": true,
		"debug": true,
		"info":  true,
		"warn":  true,
		"error": true,
		"fatal": true,
		"panic": true,
	}
	if !validLogLevels[config.Log.Level] {
		return nil, fmt.Errorf("LOG_LEVEL must be one of: trace, debug, info, warn, error, fatal, panic")
	}

	// Production-specific validations
	if config.Server.Env == "production" {
		if config.Database.SSLMode == "disable" {
			return nil, fmt.Errorf("DB_SSLMODE=disable is not allowed in production")
		}

		if config.Log.Level == "trace" || config.Log.Level == "debug" {
			return nil, fmt.Errorf("LOG_LEVEL=%s is not recommended in production", config.Log.Level)
		}
		// CORS: wildcard with credentials in production
		for _, origin := range config.CORS.AllowedOrigins {
			if origin == "*" && config.CORS.AllowCredentials {
				return nil, fmt.Errorf("CORS_ALLOWED_ORIGINS=* with CORS_ALLOW_CREDENTIALS=true is invalid per CORS spec")
			}
		}
	}

	return config, nil
}

// loadDatabaseConfig resolves database config.
// DATABASE_URL takes priority over individual DB_* env vars.
func loadDatabaseConfig() (DatabaseConfig, error) {
	rawURL := getEnv("DATABASE_URL", "")
	if rawURL != "" {
		return parseDatabaseURL(rawURL)
	}

	// Fallback: individual DB_* vars (local dev)
	password := getEnv("DB_PASSWORD", "")
	if password == "" {
		return DatabaseConfig{}, fmt.Errorf("DB_PASSWORD is required (or set DATABASE_URL)")
	}

	return DatabaseConfig{
		Host:            getEnv("DB_HOST", "localhost"),
		Port:            getEnv("DB_PORT", "5432"),
		User:            getEnv("DB_USER", "postgres"),
		Password:        password,
		DBName:          getEnv("DB_NAME", "sekre_db"),
		SSLMode:         getEnv("DB_SSLMODE", "disable"),
		MaxOpenConns:    getEnvAsInt("DB_MAX_OPEN_CONNS", 25),
		MaxIdleConns:    getEnvAsInt("DB_MAX_IDLE_CONNS", 5),
		ConnMaxLifetime: time.Duration(getEnvAsInt("DB_CONN_MAX_LIFETIME", 3600)) * time.Second,
	}, nil
}

// parseDatabaseURL parses a PostgreSQL connection URL into DatabaseConfig.
// Supports formats:
//   - postgresql://user:password@host:port/dbname?sslmode=require
//   - postgres://user:password@host:port/dbname
func parseDatabaseURL(rawURL string) (DatabaseConfig, error) {
	u, err := url.Parse(rawURL)
	if err != nil {
		return DatabaseConfig{}, fmt.Errorf("invalid DATABASE_URL: %w", err)
	}

	if u.Scheme != "postgres" && u.Scheme != "postgresql" {
		return DatabaseConfig{}, fmt.Errorf("invalid DATABASE_URL scheme: %q (expected postgres or postgresql)", u.Scheme)
	}

	host := u.Hostname()
	port := u.Port()
	if port == "" {
		port = "5432"
	}

	var user, password string
	if u.User != nil {
		user = u.User.Username()
		password, _ = u.User.Password()
	}

	dbName := strings.TrimPrefix(u.Path, "/")

	sslMode := u.Query().Get("sslmode")
	if sslMode == "" {
		sslMode = "require" // default safe for Railway
	}

	return DatabaseConfig{
		Host:            host,
		Port:            port,
		User:            user,
		Password:        password,
		DBName:          dbName,
		SSLMode:         sslMode,
		MaxOpenConns:    getEnvAsInt("DB_MAX_OPEN_CONNS", 25),
		MaxIdleConns:    getEnvAsInt("DB_MAX_IDLE_CONNS", 5),
		ConnMaxLifetime: time.Duration(getEnvAsInt("DB_CONN_MAX_LIFETIME", 3600)) * time.Second,
	}, nil
}

func (c *DatabaseConfig) ConnectionString() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode,
	)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := getEnv(key, "")
	if value, err := strconv.Atoi(valueStr); err == nil {
		return value
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	valueStr := getEnv(key, "")
	if valueStr == "" {
		return defaultValue
	}
	if value, err := strconv.ParseBool(valueStr); err == nil {
		return value
	}
	return defaultValue
}

// getEnvAsSlice parses a comma-separated env value into a slice of trimmed strings.
// Returns defaultValue if the env variable is not set or empty.
func getEnvAsSlice(key string, defaultValue []string) []string {
	valueStr := getEnv(key, "")
	if valueStr == "" {
		return defaultValue
	}
	parts := strings.Split(valueStr, ",")
	result := make([]string, 0, len(parts))
	for _, p := range parts {
		trimmed := strings.TrimSpace(p)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}
	if len(result) == 0 {
		return defaultValue
	}
	return result
}
