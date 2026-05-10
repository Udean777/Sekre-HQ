package delivery

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/username/sekre-backend/internal/auth/usecase"
	"github.com/username/sekre-backend/internal/middleware"
	"github.com/username/sekre-backend/pkg/response"
	"github.com/username/sekre-backend/pkg/token"
)

type AuthHandler struct {
	usecase      usecase.AuthUsecase
	tokenManager *token.Manager
}

func NewAuthHandler(usecase usecase.AuthUsecase, tokenManager *token.Manager) *AuthHandler {
	return &AuthHandler{
		usecase:      usecase,
		tokenManager: tokenManager,
	}
}

func (h *AuthHandler) RegisterRoutes(router *mux.Router) {
	authRouter := router.PathPrefix("/auth").Subrouter()

	// Public routes
	authRouter.HandleFunc("/register", h.Register).Methods("POST")
	authRouter.HandleFunc("/login", h.Login).Methods("POST")

	// Protected routes
	protected := authRouter.PathPrefix("").Subrouter()
	protected.Use(middleware.AuthMiddleware(h.tokenManager))
	protected.HandleFunc("/me", h.GetMe).Methods("GET")
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req usecase.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "invalid request body")
		return
	}

	result, err := h.usecase.Register(r.Context(), &req)
	if err != nil {
		response.BadRequest(w, err.Error())
		return
	}

	response.Success(w, http.StatusCreated, "organization registered successfully", result)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req usecase.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "invalid request body")
		return
	}

	result, err := h.usecase.Login(r.Context(), &req)
	if err != nil {
		response.Unauthorized(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "login successful", result)
}

func (h *AuthHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid user context")
		return
	}

	result, err := h.usecase.GetMe(r.Context(), userID)
	if err != nil {
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "user retrieved successfully", result)
}
