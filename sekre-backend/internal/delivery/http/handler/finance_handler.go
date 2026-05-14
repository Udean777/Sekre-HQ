package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/username/sekre-backend/internal/application/finance"
	"github.com/username/sekre-backend/internal/delivery/http/middleware"
	"github.com/username/sekre-backend/internal/domain/entity"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/domain/valueobject"
	"github.com/username/sekre-backend/pkg/pagination"
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

// CreateTransactionRequest represents the request payload for creating/updating transactions.
// Uses amount_cents (int64) and currency (ISO 4217) for precision.
type CreateTransactionRequest struct {
	DivisionID  string  `json:"division_id"`
	EventID     *string `json:"event_id"`
	Type        string  `json:"type"`
	AmountCents int64   `json:"amount_cents"`       // Amount in smallest currency unit (cents/sen)
	Currency    string  `json:"currency,omitempty"` // ISO 4217 currency code (default: IDR)
	Description string  `json:"description"`
	ReceiptURL  *string `json:"receipt_url"`
}

// toMoney converts the request to a Money value object
func (r *CreateTransactionRequest) toMoney() valueobject.Money {
	currency := r.Currency
	if currency == "" {
		currency = "IDR" // Default currency
	}
	return valueobject.NewMoney(r.AmountCents, currency)
}

func (h *FinanceHandler) Create(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid organization context"))
		return
	}
	userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid user context"))
		return
	}

	var req CreateTransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("body", "invalid request body"))
		return
	}

	divisionID, err := uuid.Parse(req.DivisionID)
	if err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("division_id", "invalid UUID"))
		return
	}

	var eventID *uuid.UUID
	if req.EventID != nil && *req.EventID != "" {
		parsed, err := uuid.Parse(*req.EventID)
		if err != nil {
			response.HandleError(w, r, domainerrors.InvalidInput("event_id", "invalid UUID"))
			return
		}
		eventID = &parsed
	}

	txType := types.TransactionType(req.Type)
	if err := txType.Validate(); err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("type", err.Error()))
		return
	}

	// Convert request to Money value object
	money := req.toMoney()

	// Validate money
	if err := money.Validate(); err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("currency", err.Error()))
		return
	}

	// Validate amount is positive
	if !money.IsPositive() {
		response.HandleError(w, r, domainerrors.ErrInvalidAmount)
		return
	}

	transaction := &entity.Transaction{
		OrganizationID: orgID,
		DivisionID:     divisionID,
		EventID:        eventID,
		Type:           txType,
		Amount:         money,
		Description:    req.Description,
		RequestedBy:    userID,
		ReceiptURL:     req.ReceiptURL,
	}

	if err := h.usecase.CreateTransaction(r.Context(), transaction); err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusCreated, "transaction created", transaction)
}

func (h *FinanceHandler) List(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid organization context"))
		return
	}

	filters := entity.TransactionFilters{}
	if divID := r.URL.Query().Get("division_id"); divID != "" {
		parsed, err := uuid.Parse(divID)
		if err != nil {
			response.HandleError(w, r, domainerrors.InvalidInput("division_id", "invalid UUID"))
			return
		}
		filters.DivisionID = &parsed
	}
	if txType := r.URL.Query().Get("type"); txType != "" {
		tt := types.TransactionType(txType)
		if err := tt.Validate(); err != nil {
			response.HandleError(w, r, domainerrors.InvalidInput("type", err.Error()))
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
	if search := r.URL.Query().Get("search"); search != "" {
		filters.Search = &search
	}
	if minAmount := r.URL.Query().Get("min_amount"); minAmount != "" {
		amount, err := strconv.ParseInt(minAmount, 10, 64)
		if err == nil {
			filters.MinAmount = &amount
		}
	}
	if maxAmount := r.URL.Query().Get("max_amount"); maxAmount != "" {
		amount, err := strconv.ParseInt(maxAmount, 10, 64)
		if err == nil {
			filters.MaxAmount = &amount
		}
	}

	// Parse pagination params
	paginationParams := pagination.ParseParams(r)
	domainPagination := types.NewPaginationParams(paginationParams.PageSize, paginationParams.Offset())

	transactions, total, err := h.usecase.ListPaginated(r.Context(), orgID, filters, domainPagination)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	// Create paginated response
	paginatedResponse := pagination.NewResponse(transactions, paginationParams, total)
	response.Success(w, http.StatusOK, "transactions retrieved", paginatedResponse)
}

func (h *FinanceHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid organization context"))
		return
	}

	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("id", "invalid transaction id"))
		return
	}

	transaction, err := h.usecase.GetByID(r.Context(), orgID, id)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "transaction retrieved", transaction)
}

func (h *FinanceHandler) Update(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid organization context"))
		return
	}

	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("id", "invalid transaction id"))
		return
	}

	existing, err := h.usecase.GetByID(r.Context(), orgID, id)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	var req CreateTransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("body", "invalid request body"))
		return
	}

	txType := types.TransactionType(req.Type)
	if err := txType.Validate(); err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("type", err.Error()))
		return
	}

	// Convert request to Money value object
	money := req.toMoney()

	// Validate money
	if err := money.Validate(); err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("currency", err.Error()))
		return
	}

	// Validate amount is positive
	if !money.IsPositive() {
		response.HandleError(w, r, domainerrors.ErrInvalidAmount)
		return
	}

	existing.Type = txType
	existing.Amount = money
	existing.Description = req.Description
	existing.ReceiptURL = req.ReceiptURL

	if err := h.usecase.Update(r.Context(), orgID, id, existing); err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "transaction updated", existing)
}

func (h *FinanceHandler) Delete(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid organization context"))
		return
	}

	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("id", "invalid transaction id"))
		return
	}

	if err := h.usecase.Delete(r.Context(), orgID, id); err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "transaction deleted", nil)
}

func (h *FinanceHandler) GetSummary(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid organization context"))
		return
	}

	var divisionID *uuid.UUID
	if divID := r.URL.Query().Get("division_id"); divID != "" {
		parsed, err := uuid.Parse(divID)
		if err != nil {
			response.HandleError(w, r, domainerrors.InvalidInput("division_id", "invalid UUID"))
			return
		}
		divisionID = &parsed
	}

	// Parse optional date range
	var startDate, endDate *time.Time
	if startDateStr := r.URL.Query().Get("start_date"); startDateStr != "" {
		parsed, err := time.Parse("2006-01-02", startDateStr)
		if err != nil {
			response.HandleError(w, r, domainerrors.InvalidInput("start_date", "invalid date format, use YYYY-MM-DD"))
			return
		}
		startDate = &parsed
	}
	if endDateStr := r.URL.Query().Get("end_date"); endDateStr != "" {
		parsed, err := time.Parse("2006-01-02", endDateStr)
		if err != nil {
			response.HandleError(w, r, domainerrors.InvalidInput("end_date", "invalid date format, use YYYY-MM-DD"))
			return
		}
		endDate = &parsed
	}

	// Use date range method if dates provided, otherwise use regular method
	var summary *entity.FinanceSummary
	var err error
	if startDate != nil || endDate != nil {
		summary, err = h.usecase.GetSummaryWithDateRange(r.Context(), orgID, divisionID, startDate, endDate)
	} else {
		summary, err = h.usecase.GetSummary(r.Context(), orgID, divisionID)
	}

	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "summary retrieved", summary)
}
