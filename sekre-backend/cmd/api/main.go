package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	authApp "github.com/username/sekre-backend/internal/application/auth"
	eventApp "github.com/username/sekre-backend/internal/application/event"
	financeApp "github.com/username/sekre-backend/internal/application/finance"
	orgApp "github.com/username/sekre-backend/internal/application/organization"
	taskApp "github.com/username/sekre-backend/internal/application/task"
	"github.com/username/sekre-backend/internal/config"
	"github.com/username/sekre-backend/internal/delivery/http/handler"
	"github.com/username/sekre-backend/internal/delivery/http/middleware"
	"github.com/username/sekre-backend/internal/infrastructure/auth"
	gormRepo "github.com/username/sekre-backend/internal/infrastructure/persistence/gorm/repository"
	sharedRepo "github.com/username/sekre-backend/internal/repository"
	"github.com/username/sekre-backend/pkg/database"
	"github.com/username/sekre-backend/pkg/logger"
	"github.com/username/sekre-backend/pkg/observability"
	"github.com/username/sekre-backend/pkg/token"
)

func main() {
	// Load configuration first (before logger to get log level)
	cfg, err := config.Load()
	if err != nil {
		// Use default logger for config errors
		logger.Init()
		logger.Fatalf("Failed to load config: %v", err)
	}

	// Initialize logger with configured level
	logger.InitWithLevel(cfg.Log.Level)
	logger.Info("🚀 Starting Sekre Backend API...")
	logger.Info("✓ Configuration loaded successfully")

	// Connect to database with GORM
	logger.Info("Connecting to database...")
	db, err := database.NewGormDB(database.Config{
		Host:            cfg.Database.Host,
		Port:            cfg.Database.Port,
		User:            cfg.Database.User,
		Password:        cfg.Database.Password,
		DBName:          cfg.Database.DBName,
		SSLMode:         cfg.Database.SSLMode,
		MaxOpenConns:    cfg.Database.MaxOpenConns,
		MaxIdleConns:    cfg.Database.MaxIdleConns,
		ConnMaxLifetime: cfg.Database.ConnMaxLifetime,
	})
	if err != nil {
		logger.Fatalf("Failed to connect to database: %v", err)
	}
	// Database will be closed explicitly during shutdown

	logger.Logger.Info().
		Str("host", cfg.Database.Host).
		Str("port", cfg.Database.Port).
		Str("dbname", cfg.Database.DBName).
		Msg("✓ Database connected successfully")

	// Initialize token manager
	tokenManager := token.NewManager(
		cfg.JWT.Secret,
		cfg.JWT.AccessExpiry,
		cfg.JWT.RefreshExpiry,
	)

	// Initialize shared infrastructure
	txRunner := sharedRepo.NewTxRunner(db)

	// Auth services (single-responsibility wrappers used by usecases).
	passwordHasher := auth.NewBcryptHasher(0)
	tokenGenerator := auth.NewJWTTokenGenerator(tokenManager)
	registrationValidator := auth.NewRegistrationValidator()

	// Initialize repositories (all go through the gorm repo package now).
	userRepo := gormRepo.NewUserRepository(db)
	orgRepo := gormRepo.NewOrganizationRepository(db)
	userOrgRepo := gormRepo.NewUserOrganizationRepository(db)
	userProfileRepo := gormRepo.NewUserProfileRepository(db)
	memberRepo := gormRepo.NewMemberRepository(db)
	divisionRepo := gormRepo.NewDivisionRepository(db)
	taskRepo := gormRepo.NewTaskRepository(db)
	eventRepo := gormRepo.NewEventRepository(db)
	financeRepo := gormRepo.NewTransactionRepository(db)

	// Initialize usecases
	authUsecaseInst := authApp.NewAuthUsecase(
		userRepo,
		orgRepo,
		userOrgRepo,
		txRunner,
		passwordHasher,
		tokenGenerator,
		registrationValidator,
	)
	divisionUsecaseInst := orgApp.NewDivisionUsecase(divisionRepo, taskRepo, eventRepo, financeRepo)
	userUsecaseInst := orgApp.NewUserUsecase(userProfileRepo, passwordHasher)
	memberUsecaseInst := orgApp.NewMemberUsecase(memberRepo)
	memberCreationUsecaseInst := orgApp.NewMemberCreationUsecase(memberRepo, divisionRepo, txRunner, passwordHasher)
	organizationUsecaseInst := orgApp.NewOrganizationUsecase(orgRepo)
	taskUsecaseInst := taskApp.NewTaskUsecase(taskRepo)
	eventUsecaseInst := eventApp.NewEventUsecase(eventRepo)
	financeUsecaseInst := financeApp.NewFinanceUsecase(financeRepo)

	// Initialize router
	router := mux.NewRouter()

	// Initialize observability metrics (registers Prometheus collectors)
	metrics := observability.Default()

	// Apply global middleware. RequestID runs first so every downstream
	// middleware and handler can read the correlation ID from context.
	router.Use(middleware.RequestID)
	router.Use(middleware.Timeout(30 * time.Second)) // 30-second timeout for all requests
	router.Use(middleware.Metrics(metrics))          // Capture metrics for all routes

	// Security headers (production hardening)
	securityHeadersCfg := middleware.DefaultSecurityHeadersConfig()
	if cfg.Server.Env == "production" {
		securityHeadersCfg = middleware.ProductionSecurityHeadersConfig()
	}
	router.Use(middleware.SecurityHeaders(securityHeadersCfg))

	router.Use(middleware.CORS(middleware.CORSConfig{
		AllowedOrigins:   cfg.CORS.AllowedOrigins,
		AllowedMethods:   cfg.CORS.AllowedMethods,
		AllowedHeaders:   cfg.CORS.AllowedHeaders,
		ExposedHeaders:   cfg.CORS.ExposedHeaders,
		AllowCredentials: cfg.CORS.AllowCredentials,
		MaxAge:           cfg.CORS.MaxAge,
	}))
	router.Use(middleware.Logging)

	// Operational endpoints (no auth, no rate limit)
	healthHandler := handler.NewHealthHandler(db, "1.0.0")
	router.HandleFunc("/health/live", healthHandler.Live).Methods("GET")
	router.HandleFunc("/health/ready", healthHandler.Ready).Methods("GET")
	router.Handle("/metrics", promhttp.Handler()).Methods("GET")

	// API documentation endpoints (no auth)
	docsHandler := handler.NewDocsHandler("docs/api/openapi.yaml")
	router.HandleFunc("/openapi.yaml", docsHandler.OpenAPISpec).Methods("GET")
	router.HandleFunc("/docs", docsHandler.SwaggerUI).Methods("GET")

	// API v1 routes
	apiV1 := router.PathPrefix("/api/v1").Subrouter()

	// Apply global rate limiting to all API routes (DDoS protection)
	apiV1.Use(middleware.RateLimit(middleware.DefaultRateLimitConfig()))

	// Apply auth middleware to protected routes
	protected := apiV1.PathPrefix("").Subrouter()
	protected.Use(middleware.AuthMiddleware(tokenManager))

	// Register handlers
	authHandler := handler.NewAuthHandler(authUsecaseInst, tokenManager)
	authHandler.RegisterRoutes(apiV1)

	// Public template download (no auth required)
	memberCreationHandler := handler.NewMemberCreationHandler(memberCreationUsecaseInst)
	apiV1.HandleFunc("/members/template", memberCreationHandler.DownloadTemplate).Methods("GET")

	divisionHandler := handler.NewDivisionHandler(divisionUsecaseInst)
	divisionHandler.RegisterRoutes(protected)

	userHandler := handler.NewUserHandler(userUsecaseInst)
	userHandler.RegisterRoutes(protected)

	memberHandler := handler.NewMemberHandler(memberUsecaseInst)
	memberHandler.RegisterRoutes(protected)

	organizationHandler := handler.NewOrganizationHandler(organizationUsecaseInst)
	organizationHandler.RegisterRoutes(protected)

	// Protected member creation routes
	protected.HandleFunc("/members/create", memberCreationHandler.CreateMember).Methods("POST")
	protected.HandleFunc("/members/bulk-import", memberCreationHandler.BulkImport).Methods("POST")

	taskHandler := handler.NewTaskHandler(taskUsecaseInst)
	taskHandler.RegisterRoutes(protected)

	eventHandler := handler.NewEventHandler(eventUsecaseInst)
	eventHandler.RegisterRoutes(protected)

	financeHandler := handler.NewFinanceHandler(financeUsecaseInst)
	financeHandler.RegisterRoutes(protected)

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
		ReadTimeout:  cfg.Server.ReadTimeout,
		WriteTimeout: cfg.Server.WriteTimeout,
		IdleTimeout:  60 * time.Second,
	}

	// Graceful shutdown
	go func() {
		logger.Logger.Info().
			Str("port", cfg.Server.Port).
			Str("address", addr).
			Msg("🌐 Server starting...")

		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Warn("⚠️  Received shutdown signal, gracefully shutting down...")

	// Create shutdown context with timeout from config
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), cfg.Server.ShutdownTimeout)

	// Attempt graceful shutdown
	logger.Logger.Info().
		Dur("timeout", cfg.Server.ShutdownTimeout).
		Msg("Shutting down server...")

	if err := server.Shutdown(shutdownCtx); err != nil {
		logger.Logger.Error().
			Err(err).
			Msg("❌ Server forced to shutdown")
		shutdownCancel()
		database.Close(db)
		os.Exit(1)
	}

	shutdownCancel()
	database.Close(db)
	logger.Logger.Info().Msg("✓ Server gracefully stopped")
}
