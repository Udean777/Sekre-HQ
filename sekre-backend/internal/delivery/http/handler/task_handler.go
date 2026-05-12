package handler

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/username/sekre-backend/internal/application/task"
	"github.com/username/sekre-backend/internal/domain/entity"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/pkg/response"
)

type TaskHandler struct {
	usecase task.TaskUsecase
}

func NewTaskHandler(usecase task.TaskUsecase) *TaskHandler {
	return &TaskHandler{usecase: usecase}
}

func (h *TaskHandler) RegisterRoutes(router *mux.Router) {
	router.HandleFunc("/tasks", h.Create).Methods("POST")
	router.HandleFunc("/tasks", h.List).Methods("GET")
	router.HandleFunc("/tasks/{id}", h.GetByID).Methods("GET")
	router.HandleFunc("/tasks/{id}", h.Update).Methods("PUT")
	router.HandleFunc("/tasks/{id}/status", h.UpdateStatus).Methods("PATCH")
	router.HandleFunc("/tasks/{id}", h.Delete).Methods("DELETE")
}

func (h *TaskHandler) Create(w http.ResponseWriter, r *http.Request) {
	orgID, err := GetOrgIDFromContext(r)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	var req task.CreateTaskRequest
	if err := DecodeJSONBody(r, &req); err != nil {
		response.HandleError(w, r, err)
		return
	}

	result, err := h.usecase.Create(r.Context(), orgID, &req)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusCreated, "task created", result)
}

func (h *TaskHandler) List(w http.ResponseWriter, r *http.Request) {
	orgID, err := GetOrgIDFromContext(r)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	filters := entity.TaskFilters{}

	if divID := r.URL.Query().Get("division_id"); divID != "" {
		id, err := uuid.Parse(divID)
		if err == nil {
			filters.DivisionID = &id
		}
	}

	if assigneeID := r.URL.Query().Get("assignee_id"); assigneeID != "" {
		id, err := uuid.Parse(assigneeID)
		if err == nil {
			filters.AssigneeID = &id
		}
	}

	if status := r.URL.Query().Get("status"); status != "" {
		ts := types.TaskStatus(status)
		if err := ts.Validate(); err != nil {
			response.HandleError(w, r, domainerrors.InvalidInput("status", err.Error()))
			return
		}
		statusStr := string(ts)
		filters.Status = &statusStr
	}

	tasks, err := h.usecase.List(r.Context(), orgID, filters)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "tasks retrieved", tasks)
}

func (h *TaskHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	orgID, err := GetOrgIDFromContext(r)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	id, err := ParseUUIDFromPath(r, "id")
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	result, err := h.usecase.GetByID(r.Context(), orgID, id)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "task retrieved", result)
}

func (h *TaskHandler) Update(w http.ResponseWriter, r *http.Request) {
	orgID, err := GetOrgIDFromContext(r)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	id, err := ParseUUIDFromPath(r, "id")
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	var req task.UpdateTaskRequest
	if err := DecodeJSONBody(r, &req); err != nil {
		response.HandleError(w, r, err)
		return
	}

	result, err := h.usecase.Update(r.Context(), orgID, id, &req)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "task updated", result)
}

func (h *TaskHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Status string `json:"status"`
	}

	HandleUpdateRequest(w, r, "id", &req, func(orgID, id uuid.UUID) error {
		return h.usecase.UpdateStatus(r.Context(), orgID, id, req.Status)
	}, "task status updated")
}

func (h *TaskHandler) Delete(w http.ResponseWriter, r *http.Request) {
	orgID, err := GetOrgIDFromContext(r)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	id, err := ParseUUIDFromPath(r, "id")
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	if err := h.usecase.Delete(r.Context(), orgID, id); err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "task deleted", nil)
}
