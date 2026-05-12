package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/username/sekre-backend/internal/domain"
	"github.com/username/sekre-backend/internal/middleware"
	"github.com/username/sekre-backend/internal/application/organization"
	"github.com/username/sekre-backend/pkg/response"
)

type DivisionHandler struct {
	usecase organization.DivisionUsecase
}

func NewDivisionHandler(usecase organization.DivisionUsecase) *DivisionHandler {
	return &DivisionHandler{usecase: usecase}
}

func (h *DivisionHandler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/divisions", h.Create).Methods("POST")
	router.HandleFunc("/divisions", h.List).Methods("GET")
	router.HandleFunc("/divisions/{id}", h.GetByID).Methods("GET")
	router.HandleFunc("/divisions/{id}", h.Update).Methods("PUT")
	router.HandleFunc("/divisions/{id}", h.Delete).Methods("DELETE")

	router.HandleFunc("/divisions/{id}/members", h.AddMember).Methods("POST")
	router.HandleFunc("/divisions/{id}/members/{userId}", h.RemoveMember).Methods("DELETE")
	router.HandleFunc("/divisions/{id}/members/{userId}", h.UpdateMemberRole).Methods("PATCH")
	router.HandleFunc("/divisions/{id}/members", h.GetMembers).Methods("GET")
}

func orgFromContext(r *http.Request, w http.ResponseWriter) (uuid.UUID, bool) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid organization context")
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
		response.BadRequest(w, "invalid request body")
		return
	}

	division, err := h.usecase.Create(r.Context(), orgID, &req)
	if err != nil {
		response.BadRequest(w, err.Error())
		return
	}

	response.Success(w, http.StatusCreated, "division created", division)
}

func (h *DivisionHandler) List(w http.ResponseWriter, r *http.Request) {
	orgID, ok := orgFromContext(r, w)
	if !ok {
		return
	}

	divisions, err := h.usecase.List(r.Context(), orgID)
	if err != nil {
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "divisions retrieved", divisions)
}

func (h *DivisionHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	orgID, ok := orgFromContext(r, w)
	if !ok {
		return
	}

	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.BadRequest(w, "invalid division id")
		return
	}

	division, err := h.usecase.GetByID(r.Context(), orgID, id)
	if err != nil {
		if errors.Is(err, domain.ErrDivisionNotFound) {
			response.NotFound(w, err.Error())
			return
		}
		response.InternalServerError(w, err.Error())
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
		response.BadRequest(w, "invalid division id")
		return
	}

	var req organization.UpdateDivisionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "invalid request body")
		return
	}

	division, err := h.usecase.Update(r.Context(), orgID, id, &req)
	if err != nil {
		if errors.Is(err, domain.ErrDivisionNotFound) {
			response.NotFound(w, err.Error())
			return
		}
		response.BadRequest(w, err.Error())
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
		response.BadRequest(w, "invalid division id")
		return
	}

	if err := h.usecase.Delete(r.Context(), orgID, id); err != nil {
		if errors.Is(err, domain.ErrDivisionNotFound) {
			response.NotFound(w, err.Error())
			return
		}
		response.BadRequest(w, err.Error())
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
		response.BadRequest(w, "invalid division id")
		return
	}

	var req organization.AddMemberRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "invalid request body")
		return
	}

	if err := h.usecase.AddMember(r.Context(), orgID, divisionID, &req); err != nil {
		if errors.Is(err, domain.ErrDivisionNotFound) {
			response.NotFound(w, err.Error())
			return
		}
		response.BadRequest(w, err.Error())
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
		response.BadRequest(w, "invalid division id")
		return
	}

	userID, err := uuid.Parse(vars["userId"])
	if err != nil {
		response.BadRequest(w, "invalid user id")
		return
	}

	if err := h.usecase.RemoveMember(r.Context(), orgID, divisionID, userID); err != nil {
		if errors.Is(err, domain.ErrDivisionNotFound) {
			response.NotFound(w, err.Error())
			return
		}
		response.BadRequest(w, err.Error())
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
		response.BadRequest(w, "invalid division id")
		return
	}

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

	if err := h.usecase.UpdateMemberRole(r.Context(), orgID, divisionID, userID, req.Role); err != nil {
		if errors.Is(err, domain.ErrDivisionNotFound) {
			response.NotFound(w, err.Error())
			return
		}
		response.BadRequest(w, err.Error())
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
		response.BadRequest(w, "invalid division id")
		return
	}

	members, err := h.usecase.GetMembers(r.Context(), orgID, divisionID)
	if err != nil {
		if errors.Is(err, domain.ErrDivisionNotFound) {
			response.NotFound(w, err.Error())
			return
		}
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "members retrieved", members)
}
