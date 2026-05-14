package handler

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/username/sekre-backend/internal/application/organization"
	"github.com/username/sekre-backend/internal/delivery/http/middleware"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/pkg/audit"
	"github.com/username/sekre-backend/pkg/response"
)

type OrganizationHandler struct {
	usecase      organization.OrganizationUsecase
	auditService *audit.Service
}

func NewOrganizationHandler(usecase organization.OrganizationUsecase, auditService *audit.Service) *OrganizationHandler {
	return &OrganizationHandler{
		usecase:      usecase,
		auditService: auditService,
	}
}

func (h *OrganizationHandler) RegisterRoutes(router *mux.Router) {
	// Update organization - requires OWNER or ADMIN role
	router.Handle("/organizations/me",
		middleware.RequireAdmin()(http.HandlerFunc(h.UpdateOrganization)),
	).Methods("PATCH")

	// Delete organization - requires OWNER role only
	router.Handle("/organizations/me",
		middleware.RequireOwner()(http.HandlerFunc(h.DeleteOrganization)),
	).Methods("DELETE")
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

	// Audit log the update
	h.auditService.Log(audit.Entry{
		OrganizationID: orgID,
		UserID:         userID,
		Action:         audit.ActionOrgUpdate,
		Details: map[string]interface{}{
			"name": req.Name,
		},
	})

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

	// Audit log the deletion
	h.auditService.Log(audit.Entry{
		OrganizationID: orgID,
		UserID:         userID,
		Action:         audit.ActionOrgDelete,
		Details:        map[string]interface{}{},
	})

	response.Success(w, http.StatusOK, "organization deleted successfully", nil)
}
