package handler

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/username/sekre-backend/internal/application/organization"
	"github.com/username/sekre-backend/internal/delivery/http/middleware"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/pkg/pagination"
	"github.com/username/sekre-backend/pkg/response"
)

type MemberHandler struct {
	usecase organization.MemberUsecase
}

func NewMemberHandler(usecase organization.MemberUsecase) *MemberHandler {
	return &MemberHandler{usecase: usecase}
}

func (h *MemberHandler) RegisterRoutes(router *mux.Router) {
	// List members - any authenticated user can view
	router.HandleFunc("/members", h.List).Methods("GET")

	// Update member role - requires OWNER or ADMIN
	router.Handle("/members/{userId}",
		middleware.RequireAdmin()(http.HandlerFunc(h.UpdateRole)),
	).Methods("PATCH")

	// Remove member - requires OWNER or ADMIN
	router.Handle("/members/{userId}",
		middleware.RequireAdmin()(http.HandlerFunc(h.Remove)),
	).Methods("DELETE")
}

func (h *MemberHandler) List(w http.ResponseWriter, r *http.Request) {
	orgID, err := GetOrgIDFromContext(r)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	// Parse pagination params
	paginationParams := pagination.ParseParams(r)
	domainPagination := types.NewPaginationParams(paginationParams.PageSize, paginationParams.Offset())

	members, total, err := h.usecase.ListMembersPaginated(r.Context(), orgID, domainPagination)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	// Create paginated response
	paginatedResponse := pagination.NewResponse(members, paginationParams, total)
	response.Success(w, http.StatusOK, "members retrieved", paginatedResponse)
}

func (h *MemberHandler) UpdateRole(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Role string `json:"role"`
	}

	HandleUpdateRequest(w, r, "userId", &req, func(orgID, userID uuid.UUID) error {
		return h.usecase.UpdateMemberRole(r.Context(), orgID, userID, req.Role)
	}, "member role updated")
}

func (h *MemberHandler) Remove(w http.ResponseWriter, r *http.Request) {
	orgID, err := GetOrgIDFromContext(r)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	userID, err := ParseUUIDFromPath(r, "userId")
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	if err := h.usecase.RemoveMember(r.Context(), orgID, userID); err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "member removed", nil)
}
