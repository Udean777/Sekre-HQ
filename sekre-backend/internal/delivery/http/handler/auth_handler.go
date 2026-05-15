package handler

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/username/sekre-backend/internal/application/auth"
	"github.com/username/sekre-backend/internal/delivery/http/middleware"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/pkg/response"
	"github.com/username/sekre-backend/pkg/token"
)

type AuthHandler struct {
	usecase      auth.AuthUsecase
	tokenManager *token.Manager
}

func NewAuthHandler(usecase auth.AuthUsecase, tokenManager *token.Manager) *AuthHandler {
	return &AuthHandler{
		usecase:      usecase,
		tokenManager: tokenManager,
	}
}

func (h *AuthHandler) RegisterRoutes(router *mux.Router) {
	authRouter := router.PathPrefix("/auth").Subrouter()

	// Apply stricter rate limiting for auth endpoints (prevent brute force)
	authRouter.Use(middleware.RateLimit(middleware.AuthRateLimitConfig()))

	// Public routes
	authRouter.HandleFunc("/register", h.Register).Methods("POST")
	authRouter.HandleFunc("/login", h.Login).Methods("POST")
	authRouter.HandleFunc("/refresh", h.Refresh).Methods("POST")

	// Protected routes
	protected := authRouter.PathPrefix("").Subrouter()
	protected.Use(middleware.AuthMiddleware(h.tokenManager))
	protected.HandleFunc("/me", h.GetMe).Methods("GET")
	protected.HandleFunc("/logout", h.Logout).Methods("POST")
}

type refreshRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	var req refreshRequest
	if err := DecodeAndValidate(r, &req); err != nil {
		response.HandleError(w, r, err)
		return
	}

	result, err := h.usecase.Refresh(r.Context(), req.RefreshToken)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "token refreshed successfully", result)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid user context"))
		return
	}

	if err := h.usecase.Logout(r.Context(), userID); err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "logout successful", nil)
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req auth.RegisterRequest
	if err := DecodeAndValidate(r, &req); err != nil {
		response.HandleError(w, r, err)
		return
	}

	result, err := h.usecase.Register(r.Context(), &req)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusCreated, "organization registered successfully", result)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req auth.LoginRequest
	if err := DecodeAndValidate(r, &req); err != nil {
		response.HandleError(w, r, err)
		return
	}

	result, err := h.usecase.Login(r.Context(), &req)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "login successful", result)
}

func (h *AuthHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid user context"))
		return
	}

	result, err := h.usecase.GetMe(r.Context(), userID)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "user retrieved successfully", result)
}
