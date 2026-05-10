package delivery

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/username/sekre-backend/internal/domain"
	"github.com/username/sekre-backend/internal/finance/usecase"
	"github.com/username/sekre-backend/internal/middleware"
	"github.com/username/sekre-backend/pkg/response"
)

type FinanceHandler struct {
	usecase *usecase.FinanceUsecase
}

func NewFinanceHandler(uc *usecase.FinanceUsecase) *FinanceHandler {
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
	orgID := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	userID := r.Context().Value(middleware.UserIDKey).(uuid.UUID)

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

	transaction := &domain.Transaction{
		OrganizationID: orgID,
		DivisionID:     divisionID,
		EventID:        eventID,
		Type:           req.Type,
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
	orgID := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)

	filters := make(map[string]interface{})
	if divID := r.URL.Query().Get("division_id"); divID != "" {
		filters["division_id"] = divID
	}
	if txType := r.URL.Query().Get("type"); txType != "" {
		filters["type"] = txType
	}
	if startDate := r.URL.Query().Get("start_date"); startDate != "" {
		filters["start_date"] = startDate
	}
	if endDate := r.URL.Query().Get("end_date"); endDate != "" {
		filters["end_date"] = endDate
	}

	transactions, err := h.usecase.List(r.Context(), orgID, filters)
	if err != nil {
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "transactions retrieved", transactions)
}

func (h *FinanceHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.BadRequest(w, "invalid transaction id")
		return
	}

	transaction, err := h.usecase.GetByID(r.Context(), id)
	if err != nil {
		if err == domain.ErrTransactionNotFound {
			response.NotFound(w, err.Error())
			return
		}
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "transaction retrieved", transaction)
}

func (h *FinanceHandler) Update(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.BadRequest(w, "invalid transaction id")
		return
	}

	// Get existing transaction
	existing, err := h.usecase.GetByID(r.Context(), id)
	if err != nil {
		if err == domain.ErrTransactionNotFound {
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

	// Update fields
	existing.Type = req.Type
	existing.Amount = req.Amount
	existing.Description = req.Description
	existing.ReceiptURL = req.ReceiptURL

	if err := h.usecase.Update(r.Context(), id, existing); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "transaction updated", existing)
}

func (h *FinanceHandler) Delete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := uuid.Parse(vars["id"])
	if err != nil {
		response.BadRequest(w, "invalid transaction id")
		return
	}

	if err := h.usecase.Delete(r.Context(), id); err != nil {
		if err == domain.ErrTransactionNotFound {
			response.NotFound(w, err.Error())
			return
		}
		response.InternalServerError(w, err.Error())
		return
	}

	response.Success(w, http.StatusOK, "transaction deleted", nil)
}

func (h *FinanceHandler) GetSummary(w http.ResponseWriter, r *http.Request) {
	orgID := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)

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
