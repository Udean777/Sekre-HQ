package delivery

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/username/sekre-backend/internal/middleware"
	"github.com/username/sekre-backend/internal/task/repository"
	"github.com/username/sekre-backend/internal/task/usecase"
	"github.com/username/sekre-backend/pkg/response"
)

type TaskHandler struct {
	usecase usecase.TaskUsecase
}

func NewTaskHandler(usecase usecase.TaskUsecase) *TaskHandler {
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
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid organization context")
		return
	}

	var req usecase.CreateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "invalid request body")
		return
	}

	task, err := h.usecase.Create(r.Context(), orgID, &req)
	if err != nil {
		response.BadRequest(w, err.Error())
		return
	}

	response.Success(w, http.StatusCreated, "task created", task)
}

func (h *TaskHandler) List(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid organization context")
		return
	}

	filters := repository.TaskFilters{}

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
		filters.Status = &status
	}

	tasks, err := h.usecase.List(r.Context(), orgID, filters)
	if err != nil {
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "tasks retrieved", tasks)
}

func (h *TaskHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.BadRequest(w, "invalid task id")
		return
	}

	task, err := h.usecase.GetByID(r.Context(), id)
	if err != nil {
		response.NotFound(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "task retrieved", task)
}

func (h *TaskHandler) Update(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.BadRequest(w, "invalid task id")
		return
	}

	var req usecase.UpdateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "invalid request body")
		return
	}

	task, err := h.usecase.Update(r.Context(), id, &req)
	if err != nil {
		response.BadRequest(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "task updated", task)
}

func (h *TaskHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.BadRequest(w, "invalid task id")
		return
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "invalid request body")
		return
	}

	if err := h.usecase.UpdateStatus(r.Context(), id, req.Status); err != nil {
		response.BadRequest(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "task status updated", nil)
}

func (h *TaskHandler) Delete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.BadRequest(w, "invalid task id")
		return
	}

	if err := h.usecase.Delete(r.Context(), id); err != nil {
		response.BadRequest(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "task deleted", nil)
}
