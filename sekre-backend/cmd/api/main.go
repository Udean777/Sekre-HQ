package main

import (
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/mux"
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
	"github.com/username/sekre-backend/pkg/token"
)

func main() {
	// Initialize logger with beautiful output
	logger.Init()
	logger.Info("🚀 Starting Sekre Backend API...")

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		logger.Fatalf("Failed to load config: %v", err)
	}
	logger.Info("✓ Configuration loaded successfully")

	// Connect to database with GORM
	logger.Info("Connecting to database...")
	db, err := database.NewGormDB(database.Config{
		Host:     cfg.Database.Host,
		Port:     cfg.Database.Port,
		User:     cfg.Database.User,
		Password: cfg.Database.Password,
		DBName:   cfg.Database.DBName,
		SSLMode:  cfg.Database.SSLMode,
	})
	if err != nil {
		logger.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close(db)

	logger.Logger.Info().
		Str("host", cfg.Database.Host).
		Str("port", cfg.Database.Port).
		Str("dbname", cfg.Database.DBName).
		Msg("✓ Database connected successfully")

	// Initialize token manager
	tokenManager := token.NewManager(
		cfg.JWT.Secret,
		cfg.JWT.AccessTokenTTL,
		cfg.JWT.RefreshTokenTTL,
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

	// Apply global middleware. RequestID runs first so every downstream
	// middleware and handler can read the correlation ID from context.
	router.Use(middleware.RequestID)
	router.Use(middleware.CORS)
	router.Use(middleware.Logging)

	// API v1 routes
	apiV1 := router.PathPrefix("/api/v1").Subrouter()

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
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
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
}
