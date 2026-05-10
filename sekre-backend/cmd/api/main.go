package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
	"github.com/username/sekre-backend/internal/auth/delivery"
	"github.com/username/sekre-backend/internal/auth/repository"
	"github.com/username/sekre-backend/internal/auth/usecase"
	"github.com/username/sekre-backend/internal/config"
	"github.com/username/sekre-backend/internal/middleware"
	"github.com/username/sekre-backend/pkg/logger"
	"github.com/username/sekre-backend/pkg/token"
)

func main() {
	// Initialize logger
	logger.Init()
	logger.Info.Println("Starting Sekre Backend API...")

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		logger.Error.Fatalf("Failed to load config: %v", err)
	}

	// Connect to database
	db, err := connectDB(cfg.Database)
	if err != nil {
		logger.Error.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	logger.Info.Println("Database connected successfully")

	// Initialize token manager
	tokenManager := token.NewManager(
		cfg.JWT.Secret,
		cfg.JWT.AccessTokenTTL,
		cfg.JWT.RefreshTokenTTL,
	)

	// Initialize repositories
	authRepo := repository.NewAuthRepository(db)

	// Initialize usecases
	authUsecase := usecase.NewAuthUsecase(authRepo, tokenManager)

	// Initialize router
	router := mux.NewRouter()

	// Apply global middleware
	router.Use(middleware.CORS)
	router.Use(middleware.Logging)

	// API v1 routes
	apiV1 := router.PathPrefix("/api/v1").Subrouter()

	// Register handlers
	authHandler := delivery.NewAuthHandler(authUsecase, tokenManager)
	authHandler.RegisterRoutes(apiV1)

	// Health check endpoint
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	}).Methods("GET")

	// Handle OPTIONS for all routes (CORS preflight)
	router.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		w.WriteHeader(http.StatusNotFound)
	}).Methods("OPTIONS")

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	server := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	go func() {
		logger.Info.Printf("Server starting on %s", addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info.Println("Server shutting down...")
}

func connectDB(cfg config.DatabaseConfig) (*sql.DB, error) {
	db, err := sql.Open("postgres", cfg.ConnectionString())
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Set connection pool settings
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	return db, nil
}
