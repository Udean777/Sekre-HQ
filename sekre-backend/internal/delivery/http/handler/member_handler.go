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

type MemberHandler struct {
	usecase organization.MemberUsecase
}

func NewMemberHandler(usecase organization.MemberUsecase) *MemberHandler {
	return &MemberHandler{usecase: usecase}
}

func (h *MemberHandler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/members", h.List).Methods("GET")
	router.HandleFunc("/members/{userId}", h.UpdateRole).Methods("PATCH")
	router.HandleFunc("/members/{userId}", h.Remove).Methods("DELETE")
}

func (h *MemberHandler) List(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid organization context"))
		return
	}

	members, err := h.usecase.ListMembers(r.Context(), orgID)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "members retrieved", members)
}

func (h *MemberHandler) UpdateRole(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid organization context"))
		return
	}

	vars := mux.Vars(r)
	userID, err := uuid.Parse(vars["userId"])
	if err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("userId", "invalid UUID"))
		return
	}

	var req struct {
		Role string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("body", "invalid request body"))
		return
	}

	if err := h.usecase.UpdateMemberRole(r.Context(), orgID, userID, req.Role); err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "member role updated", nil)
}

func (h *MemberHandler) Remove(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid organization context"))
		return
	}

	vars := mux.Vars(r)
	userID, err := uuid.Parse(vars["userId"])
	if err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("userId", "invalid UUID"))
		return
	}

	if err := h.usecase.RemoveMember(r.Context(), orgID, userID); err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "member removed", nil)
}
