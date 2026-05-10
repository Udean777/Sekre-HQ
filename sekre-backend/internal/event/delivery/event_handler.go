package delivery

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/username/sekre-backend/internal/domain"
	"github.com/username/sekre-backend/internal/event/usecase"
	"github.com/username/sekre-backend/internal/middleware"
	"github.com/username/sekre-backend/pkg/response"
)

type EventHandler struct {
	usecase *usecase.EventUsecase
}

func NewEventHandler(uc *usecase.EventUsecase) *EventHandler {
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
	var req CreateEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "invalid request body")
		return
	}

	orgID := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
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

	event := &domain.Event{
		OrganizationID: orgID,
		DivisionID:     divisionID,
		Title:          req.Title,
		Description:    req.Description,
		StartTime:      startTime,
		EndTime:        endTime,
		Location:       req.Location,
	}

	if err := h.usecase.Create(r.Context(), event); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(w, http.StatusCreated, "event created", event)
}

func (h *EventHandler) List(w http.ResponseWriter, r *http.Request) {
	orgID := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)

	filters := make(map[string]interface{})
	if divID := r.URL.Query().Get("division_id"); divID != "" {
		filters["division_id"] = divID
	}
	if startDate := r.URL.Query().Get("start_date"); startDate != "" {
		filters["start_date"] = startDate
	}
	if endDate := r.URL.Query().Get("end_date"); endDate != "" {
		filters["end_date"] = endDate
	}

	events, err := h.usecase.List(r.Context(), orgID, filters)
	if err != nil {
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "events retrieved", events)
}

func (h *EventHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.BadRequest(w, "invalid event id")
		return
	}

	event, err := h.usecase.GetByID(r.Context(), id)
	if err != nil {
		if err == domain.ErrEventNotFound {
			response.NotFound(w, err.Error())
			return
		}
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "event retrieved", event)
}

func (h *EventHandler) Update(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.BadRequest(w, "invalid event id")
		return
	}

	// Get existing event
	existing, err := h.usecase.GetByID(r.Context(), id)
	if err != nil {
		if err == domain.ErrEventNotFound {
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

	orgID := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)

	event := &domain.Event{
		OrganizationID: orgID,
		DivisionID:     existing.DivisionID, // Keep existing division
		Title:          req.Title,
		Description:    req.Description,
		StartTime:      startTime,
		EndTime:        endTime,
		Location:       req.Location,
	}

	if err := h.usecase.Update(r.Context(), id, event); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "event updated", event)
}

func (h *EventHandler) Delete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.BadRequest(w, "invalid event id")
		return
	}

	if err := h.usecase.Delete(r.Context(), id); err != nil {
		if err == domain.ErrEventNotFound {
			response.NotFound(w, err.Error())
			return
		}
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "event deleted", nil)
}
