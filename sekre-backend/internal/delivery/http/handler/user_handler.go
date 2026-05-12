package handler

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/username/sekre-backend/internal/middleware"
	"github.com/username/sekre-backend/internal/application/organization"
	"github.com/username/sekre-backend/pkg/response"
)

type UserHandler struct {
	usecase organization.UserUsecase
}

func NewUserHandler(usecase organization.UserUsecase) *UserHandler {
	return &UserHandler{usecase: usecase}
}

func (h *UserHandler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/users/search", h.SearchUsers).Methods("GET")
	router.HandleFunc("/users", h.ListUsers).Methods("GET")
	router.HandleFunc("/users/me/profile", h.UpdateProfile).Methods("PATCH")
	router.HandleFunc("/users/me/change-password", h.ChangePassword).Methods("POST")
}

// SearchUsers searches for users in the organization
func (h *UserHandler) SearchUsers(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid organization context")
		return
	}

	query := r.URL.Query().Get("q")
	if query == "" {
		response.BadRequest(w, "search query is required")
		return
	}

	users, err := h.usecase.SearchUsers(r.Context(), orgID, query)
	if err != nil {
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "users found", users)
}

// ListUsers lists all users in the organization
func (h *UserHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid organization context")
		return
	}

	users, err := h.usecase.GetOrganizationUsers(r.Context(), orgID)
	if err != nil {
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "users retrieved", users)
}

// UpdateProfile updates the current user's profile
func (h *UserHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid user context")
		return
	}

	var req struct {
		FullName string `json:"full_name"`
		Email    string `json:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "invalid request body")
		return
	}

	user, err := h.usecase.UpdateProfile(r.Context(), userID, req.FullName, req.Email)
	if err != nil {
		response.BadRequest(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "profile updated successfully", user)
}

// ChangePassword changes the current user's password
func (h *UserHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid user context")
		return
	}

	var req struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "invalid request body")
		return
	}

	if err := h.usecase.ChangePassword(r.Context(), userID, req.CurrentPassword, req.NewPassword); err != nil {
		response.BadRequest(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "password changed successfully", nil)
}
