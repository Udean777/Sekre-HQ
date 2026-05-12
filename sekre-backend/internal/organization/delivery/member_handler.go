package delivery

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/username/sekre-backend/internal/middleware"
	"github.com/username/sekre-backend/internal/organization/usecase"
	"github.com/username/sekre-backend/pkg/response"
)

type MemberHandler struct {
	usecase usecase.MemberUsecase
}

func NewMemberHandler(usecase usecase.MemberUsecase) *MemberHandler {
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
		response.Unauthorized(w, "invalid organization context")
		return
	}

	members, err := h.usecase.ListMembers(r.Context(), orgID)
	if err != nil {
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "members retrieved", members)
}

func (h *MemberHandler) UpdateRole(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid organization context")
		return
	}

	vars := mux.Vars(r)
	userID, err := uuid.Parse(vars["userId"])
	if err != nil {
		response.BadRequest(w, "invalid user id")
		return
	}

	var req struct {
		Role string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "invalid request body")
		return
	}

	if err := h.usecase.UpdateMemberRole(r.Context(), orgID, userID, req.Role); err != nil {
		response.BadRequest(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "member role updated", nil)
}

func (h *MemberHandler) Remove(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid organization context")
		return
	}

	vars := mux.Vars(r)
	userID, err := uuid.Parse(vars["userId"])
	if err != nil {
		response.BadRequest(w, "invalid user id")
		return
	}

	if err := h.usecase.RemoveMember(r.Context(), orgID, userID); err != nil {
		response.BadRequest(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "member removed", nil)
}
