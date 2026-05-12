package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/username/sekre-backend/internal/application/event"
	"github.com/username/sekre-backend/internal/domain"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/middleware"
	"github.com/username/sekre-backend/pkg/response"
)

type EventHandler struct {
	usecase event.EventUsecase
}

func NewEventHandler(uc event.EventUsecase) *EventHandler {
	return &EventHandler{usecase: uc}
}

func (h *EventHandler) RegisterRoutes(r *mux.Router) {
	r.HandleFunc("/events", h.Create).Methods("POST")
	r.HandleFunc("/events", h.List).Methods("GET")
	r.HandleFunc("/events/{id}", h.GetByID).Methods("GET")
	r.HandleFunc("/events/{id}", h.Update).Methods("PUT")
	r.HandleFunc("/events/{id}", h.Delete).Methods("DELETE")
}

type CreateEventRequest struct {
	DivisionID  string `json:"division_id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	StartTime   string `json:"start_time"`
	EndTime     string `json:"end_time"`
	Location    string `json:"location"`
}

func (h *EventHandler) Create(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid organization context")
		return
	}

	var req CreateEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "invalid request body")
		return
	}

	divisionID, err := uuid.Parse(req.DivisionID)
	if err != nil {
		response.BadRequest(w, "invalid division_id")
		return
	}

	startTime, err := time.Parse(time.RFC3339, req.StartTime)
	if err != nil {
		response.BadRequest(w, "invalid start_time format")
		return
	}

	endTime, err := time.Parse(time.RFC3339, req.EndTime)
	if err != nil {
		response.BadRequest(w, "invalid end_time format")
		return
	}

	ev := &entity.Event{
		OrganizationID: orgID,
		DivisionID:     divisionID,
		Title:          req.Title,
		Description:    req.Description,
		StartTime:      startTime,
		EndTime:        endTime,
		Location:       req.Location,
	}

	if err := h.usecase.Create(r.Context(), orgID, ev); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(w, http.StatusCreated, "event created", ev)
}

func (h *EventHandler) List(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid organization context")
		return
	}

	divID := r.URL.Query().Get("division_id")
	if divID == "" {
		response.BadRequest(w, "division_id required")
		return
	}

	divisionID, err := uuid.Parse(divID)
	if err != nil {
		response.BadRequest(w, "invalid division_id")
		return
	}

	events, err := h.usecase.List(r.Context(), orgID, divisionID)
	if err != nil {
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "events retrieved", events)
}

func (h *EventHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid organization context")
		return
	}

	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.BadRequest(w, "invalid event id")
		return
	}

	ev, err := h.usecase.GetByID(r.Context(), orgID, id)
	if err != nil {
		if errors.Is(err, domain.ErrEventNotFound) {
			response.NotFound(w, err.Error())
			return
		}
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "event retrieved", ev)
}

func (h *EventHandler) Update(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid organization context")
		return
	}

	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.BadRequest(w, "invalid event id")
		return
	}

	existing, err := h.usecase.GetByID(r.Context(), orgID, id)
	if err != nil {
		if errors.Is(err, domain.ErrEventNotFound) {
			response.NotFound(w, err.Error())
			return
		}
		response.InternalServerError(w, err.Error())
		return
	}

	var req CreateEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "invalid request body")
		return
	}

	startTime, err := time.Parse(time.RFC3339, req.StartTime)
	if err != nil {
		response.BadRequest(w, "invalid start_time format")
		return
	}

	endTime, err := time.Parse(time.RFC3339, req.EndTime)
	if err != nil {
		response.BadRequest(w, "invalid end_time format")
		return
	}

	ev := &entity.Event{
		OrganizationID: orgID,
		DivisionID:     existing.DivisionID,
		Title:          req.Title,
		Description:    req.Description,
		StartTime:      startTime,
		EndTime:        endTime,
		Location:       req.Location,
	}

	if err := h.usecase.Update(r.Context(), orgID, id, ev); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "event updated", ev)
}

func (h *EventHandler) Delete(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid organization context")
		return
	}

	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.BadRequest(w, "invalid event id")
		return
	}

	if err := h.usecase.Delete(r.Context(), orgID, id); err != nil {
		if errors.Is(err, domain.ErrEventNotFound) {
			response.NotFound(w, err.Error())
			return
		}
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "event deleted", nil)
}
