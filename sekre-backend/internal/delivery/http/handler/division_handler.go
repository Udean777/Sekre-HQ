package handler

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/username/sekre-backend/internal/application/organization"
	"github.com/username/sekre-backend/internal/delivery/http/middleware"
	"github.com/username/sekre-backend/internal/domain/types"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/pkg/pagination"
	"github.com/username/sekre-backend/pkg/response"
)

type DivisionHandler struct {
	usecase organization.DivisionUsecase
}

func NewDivisionHandler(usecase organization.DivisionUsecase) *DivisionHandler {
	return &DivisionHandler{usecase: usecase}
}

func (h *DivisionHandler) RegisterRoutes(router *mux.Router) {
	// Create division - requires OWNER or ADMIN
	router.Handle("/divisions",
		middleware.RequireAdmin()(http.HandlerFunc(h.Create)),
	).Methods("POST")

	// List and view divisions - any authenticated user
	router.HandleFunc("/divisions", h.List).Methods("GET")
	router.HandleFunc("/divisions/{id}", h.GetByID).Methods("GET")
	router.HandleFunc("/divisions/{id}/members", h.GetMembers).Methods("GET")

	// Update division - requires OWNER or ADMIN
	router.Handle("/divisions/{id}",
		middleware.RequireAdmin()(http.HandlerFunc(h.Update)),
	).Methods("PUT")

	// Delete division - requires OWNER or ADMIN
	router.Handle("/divisions/{id}",
		middleware.RequireAdmin()(http.HandlerFunc(h.Delete)),
	).Methods("DELETE")

	// Manage division members - requires OWNER or ADMIN
	router.Handle("/divisions/{id}/members",
		middleware.RequireAdmin()(http.HandlerFunc(h.AddMember)),
	).Methods("POST")

	router.Handle("/divisions/{id}/members/{userId}",
		middleware.RequireAdmin()(http.HandlerFunc(h.RemoveMember)),
	).Methods("DELETE")

	router.Handle("/divisions/{id}/members/{userId}",
		middleware.RequireAdmin()(http.HandlerFunc(h.UpdateMemberRole)),
	).Methods("PATCH")
}

// orgFromContext extracts the authenticated organization ID from the request
// context, writing an error response and returning ok=false when missing.
func orgFromContext(r *http.Request, w http.ResponseWriter) (uuid.UUID, bool) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid organization context"))
		return uuid.Nil, false
	}
	return orgID, true
}

func (h *DivisionHandler) Create(w http.ResponseWriter, r *http.Request) {
	orgID, ok := orgFromContext(r, w)
	if !ok {
		return
	}

	var req organization.CreateDivisionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("body", "invalid request body"))
		return
	}

	division, err := h.usecase.Create(r.Context(), orgID, &req)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusCreated, "division created", division)
}

func (h *DivisionHandler) List(w http.ResponseWriter, r *http.Request) {
	orgID, ok := orgFromContext(r, w)
	if !ok {
		return
	}

	// Parse pagination params
	paginationParams := pagination.ParseParams(r)
	domainPagination := types.NewPaginationParams(paginationParams.PageSize, paginationParams.Offset())

	divisions, total, err := h.usecase.ListPaginated(r.Context(), orgID, domainPagination)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	// Create paginated response
	paginatedResponse := pagination.NewResponse(divisions, paginationParams, total)
	response.Success(w, http.StatusOK, "divisions retrieved", paginatedResponse)
}

func (h *DivisionHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	orgID, ok := orgFromContext(r, w)
	if !ok {
		return
	}

	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("id", "invalid division id"))
		return
	}

	division, err := h.usecase.GetByID(r.Context(), orgID, id)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "division retrieved", division)
}

func (h *DivisionHandler) Update(w http.ResponseWriter, r *http.Request) {
	orgID, ok := orgFromContext(r, w)
	if !ok {
		return
	}

	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("id", "invalid division id"))
		return
	}

	var req organization.UpdateDivisionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("body", "invalid request body"))
		return
	}

	division, err := h.usecase.Update(r.Context(), orgID, id, &req)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "division updated", division)
}

func (h *DivisionHandler) Delete(w http.ResponseWriter, r *http.Request) {
	orgID, ok := orgFromContext(r, w)
	if !ok {
		return
	}

	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("id", "invalid division id"))
		return
	}

	if err := h.usecase.Delete(r.Context(), orgID, id); err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "division deleted", nil)
}

func (h *DivisionHandler) AddMember(w http.ResponseWriter, r *http.Request) {
	orgID, ok := orgFromContext(r, w)
	if !ok {
		return
	}

	vars := mux.Vars(r)
	divisionID, err := uuid.Parse(vars["id"])
	if err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("id", "invalid division id"))
		return
	}

	var req organization.AddMemberRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("body", "invalid request body"))
		return
	}

	if err := h.usecase.AddMember(r.Context(), orgID, divisionID, &req); err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "member added", nil)
}

func (h *DivisionHandler) RemoveMember(w http.ResponseWriter, r *http.Request) {
	orgID, ok := orgFromContext(r, w)
	if !ok {
		return
	}

	vars := mux.Vars(r)
	divisionID, err := uuid.Parse(vars["id"])
	if err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("id", "invalid division id"))
		return
	}

	userID, err := uuid.Parse(vars["userId"])
	if err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("userId", "invalid user id"))
		return
	}

	if err := h.usecase.RemoveMember(r.Context(), orgID, divisionID, userID); err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "member removed", nil)
}

func (h *DivisionHandler) UpdateMemberRole(w http.ResponseWriter, r *http.Request) {
	orgID, ok := orgFromContext(r, w)
	if !ok {
		return
	}

	vars := mux.Vars(r)
	divisionID, err := uuid.Parse(vars["id"])
	if err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("id", "invalid division id"))
		return
	}

	userID, err := uuid.Parse(vars["userId"])
	if err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("userId", "invalid user id"))
		return
	}

	var req struct {
		Role string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("body", "invalid request body"))
		return
	}

	if err := h.usecase.UpdateMemberRole(r.Context(), orgID, divisionID, userID, req.Role); err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "member role updated", nil)
}

func (h *DivisionHandler) GetMembers(w http.ResponseWriter, r *http.Request) {
	orgID, ok := orgFromContext(r, w)
	if !ok {
		return
	}

	vars := mux.Vars(r)
	divisionID, err := uuid.Parse(vars["id"])
	if err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("id", "invalid division id"))
		return
	}

	// Parse pagination params
	paginationParams := pagination.ParseParams(r)
	domainPagination := types.NewPaginationParams(paginationParams.PageSize, paginationParams.Offset())

	members, total, err := h.usecase.GetMembersPaginated(r.Context(), orgID, divisionID, domainPagination)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	// Create paginated response
	paginatedResponse := pagination.NewResponse(members, paginationParams, total)
	response.Success(w, http.StatusOK, "division members retrieved", paginatedResponse)
}
