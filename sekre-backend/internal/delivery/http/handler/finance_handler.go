package handler

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/username/sekre-backend/internal/application/finance"
	"github.com/username/sekre-backend/internal/domain"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/middleware"
	"github.com/username/sekre-backend/pkg/response"
)

type FinanceHandler struct {
	usecase finance.FinanceUsecase
}

func NewFinanceHandler(uc finance.FinanceUsecase) *FinanceHandler {
	return &FinanceHandler{usecase: uc}
}

func (h *FinanceHandler) RegisterRoutes(r *mux.Router) {
	r.HandleFunc("/transactions", h.Create).Methods("POST")
	r.HandleFunc("/transactions", h.List).Methods("GET")
	r.HandleFunc("/transactions/{id}", h.GetByID).Methods("GET")
	r.HandleFunc("/transactions/{id}", h.Update).Methods("PUT")
	r.HandleFunc("/transactions/{id}", h.Delete).Methods("DELETE")
	r.HandleFunc("/finance/summary", h.GetSummary).Methods("GET")
}

type CreateTransactionRequest struct {
	DivisionID  string  `json:"division_id"`
	EventID     *string `json:"event_id"`
	Type        string  `json:"type"`
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
	ReceiptURL  *string `json:"receipt_url"`
}

func (h *FinanceHandler) Create(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid organization context")
		return
	}
	userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid user context")
		return
	}

	var req CreateTransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "invalid request body")
		return
	}

	divisionID, err := uuid.Parse(req.DivisionID)
	if err != nil {
		response.BadRequest(w, "invalid division_id")
		return
	}

	var eventID *uuid.UUID
	if req.EventID != nil && *req.EventID != "" {
		parsed, err := uuid.Parse(*req.EventID)
		if err != nil {
			response.BadRequest(w, "invalid event_id")
			return
		}
		eventID = &parsed
	}

	txType := types.TransactionType(req.Type)
	if err := txType.Validate(); err != nil {
		response.BadRequest(w, err.Error())
		return
	}

	transaction := &entity.Transaction{
		OrganizationID: orgID,
		DivisionID:     divisionID,
		EventID:        eventID,
		Type:           txType,
		Amount:         req.Amount,
		Description:    req.Description,
		RequestedBy:    userID,
		ReceiptURL:     req.ReceiptURL,
	}

	if err := h.usecase.CreateTransaction(r.Context(), transaction); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(w, http.StatusCreated, "transaction created", transaction)
}

func (h *FinanceHandler) List(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid organization context")
		return
	}

	filters := entity.TransactionFilters{}
	if divID := r.URL.Query().Get("division_id"); divID != "" {
		parsed, err := uuid.Parse(divID)
		if err != nil {
			response.BadRequest(w, "invalid division_id")
			return
		}
		filters.DivisionID = &parsed
	}
	if txType := r.URL.Query().Get("type"); txType != "" {
		tt := types.TransactionType(txType)
		if err := tt.Validate(); err != nil {
			response.BadRequest(w, err.Error())
			return
		}
		filters.Type = &tt
	}
	if startDate := r.URL.Query().Get("start_date"); startDate != "" {
		filters.StartDate = &startDate
	}
	if endDate := r.URL.Query().Get("end_date"); endDate != "" {
		filters.EndDate = &endDate
	}

	transactions, err := h.usecase.List(r.Context(), orgID, filters)
	if err != nil {
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "transactions retrieved", transactions)
}

func (h *FinanceHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid organization context")
		return
	}

	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.BadRequest(w, "invalid transaction id")
		return
	}

	transaction, err := h.usecase.GetByID(r.Context(), orgID, id)
	if err != nil {
		if errors.Is(err, domain.ErrTransactionNotFound) {
			response.NotFound(w, err.Error())
			return
		}
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "transaction retrieved", transaction)
}

func (h *FinanceHandler) Update(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid organization context")
		return
	}

	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.BadRequest(w, "invalid transaction id")
		return
	}

	existing, err := h.usecase.GetByID(r.Context(), orgID, id)
	if err != nil {
		if errors.Is(err, domain.ErrTransactionNotFound) {
			response.NotFound(w, err.Error())
			return
		}
		response.InternalServerError(w, err.Error())
		return
	}

	var req CreateTransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "invalid request body")
		return
	}

	txType := types.TransactionType(req.Type)
	if err := txType.Validate(); err != nil {
		response.BadRequest(w, err.Error())
		return
	}

	existing.Type = txType
	existing.Amount = req.Amount
	existing.Description = req.Description
	existing.ReceiptURL = req.ReceiptURL

	if err := h.usecase.Update(r.Context(), orgID, id, existing); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "transaction updated", existing)
}

func (h *FinanceHandler) Delete(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid organization context")
		return
	}

	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.BadRequest(w, "invalid transaction id")
		return
	}

	if err := h.usecase.Delete(r.Context(), orgID, id); err != nil {
		if errors.Is(err, domain.ErrTransactionNotFound) {
			response.NotFound(w, err.Error())
			return
		}
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "transaction deleted", nil)
}

func (h *FinanceHandler) GetSummary(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.Unauthorized(w, "invalid organization context")
		return
	}

	var divisionID *uuid.UUID
	if divID := r.URL.Query().Get("division_id"); divID != "" {
		parsed, err := uuid.Parse(divID)
		if err != nil {
			response.BadRequest(w, "invalid division_id")
			return
		}
		divisionID = &parsed
	}

	summary, err := h.usecase.GetSummary(r.Context(), orgID, divisionID)
	if err != nil {
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "summary retrieved", summary)
}
