package handler

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/username/sekre-backend/internal/application/organization"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/middleware"
	"github.com/username/sekre-backend/pkg/response"
)

type OrganizationHandler struct {
	usecase organization.OrganizationUsecase
}

func NewOrganizationHandler(usecase organization.OrganizationUsecase) *OrganizationHandler {
	return &OrganizationHandler{usecase: usecase}
}

func (h *OrganizationHandler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/organizations/me", h.UpdateOrganization).Methods("PATCH")
	router.HandleFunc("/organizations/me", h.DeleteOrganization).Methods("DELETE")
}

// UpdateOrganization updates the current organization
func (h *OrganizationHandler) UpdateOrganization(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid organization context"))
		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid user context"))
		return
	}

	var req struct {
		Name string `json:"name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("body", "invalid request body"))
		return
	}

	org, err := h.usecase.UpdateOrganization(r.Context(), orgID, userID, req.Name)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "organization updated successfully", org)
}

// DeleteOrganization deletes the current organization
func (h *OrganizationHandler) DeleteOrganization(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid organization context"))
		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid user context"))
		return
	}

	if err := h.usecase.DeleteOrganization(r.Context(), orgID, userID); err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "organization deleted successfully", nil)
}
