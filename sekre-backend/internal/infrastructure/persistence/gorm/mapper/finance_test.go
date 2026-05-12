package mapper

import (
	"testing"
	"time"

	"github.com/google/uuid"
	domainEntity "github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/domain/valueobject"
	"github.com/username/sekre-backend/internal/models"
)

func TestTransactionToModel_IDR(t *testing.T) {
	money := valueobject.NewMoney(5000000, "IDR") // 50000.00 IDR
	e := &domainEntity.Transaction{
		ID:             uuid.New(),
		OrganizationID: uuid.New(),
		DivisionID:     uuid.New(),
		Type:           types.TransactionTypeIncome,
		Amount:         money,
		Description:    "Test transaction",
		Status:         types.TransactionStatusPending,
		RequestedBy:    uuid.New(),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	model := TransactionToModel(e)

	if model == nil {
		t.Fatal("TransactionToModel returned nil")
	}

	if model.AmountCents != 5000000 {
		t.Errorf("AmountCents = %d, want 5000000", model.AmountCents)
	}
	if model.Currency != "IDR" {
		t.Errorf("Currency = %s, want IDR", model.Currency)
	}
}

func TestTransactionToModel_USD(t *testing.T) {
	money := valueobject.NewMoney(10050, "USD") // 100.50 USD
	e := &domainEntity.Transaction{
		ID:             uuid.New(),
		OrganizationID: uuid.New(),
		DivisionID:     uuid.New(),
		Type:           types.TransactionTypeIncome,
		Amount:         money,
		Description:    "USD transaction",
		Status:         types.TransactionStatusPending,
		RequestedBy:    uuid.New(),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	model := TransactionToModel(e)

	if model == nil {
		t.Fatal("TransactionToModel returned nil")
	}

	if model.AmountCents != 10050 {
		t.Errorf("AmountCents = %d, want 10050", model.AmountCents)
	}
	if model.Currency != "USD" {
		t.Errorf("Currency = %s, want USD", model.Currency)
	}
}

func TestTransactionToModel_EmptyCurrencyDefaultsToIDR(t *testing.T) {
	// Money with empty currency (shouldn't happen in practice but handle gracefully)
	money := valueobject.Money{AmountCents: 5000000, Currency: ""}
	e := &domainEntity.Transaction{
		ID:             uuid.New(),
		OrganizationID: uuid.New(),
		DivisionID:     uuid.New(),
		Type:           types.TransactionTypeIncome,
		Amount:         money,
		Description:    "Test transaction",
		Status:         types.TransactionStatusPending,
		RequestedBy:    uuid.New(),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	model := TransactionToModel(e)

	if model.Currency != "IDR" {
		t.Errorf("Currency = %s, want IDR (default)", model.Currency)
	}
}

func TestTransactionToModel_Nil(t *testing.T) {
	model := TransactionToModel(nil)
	if model != nil {
		t.Error("TransactionToModel(nil) should return nil")
	}
}

func TestTransactionToEntity_IDR(t *testing.T) {
	model := &models.Transaction{
		ID:             uuid.New(),
		OrganizationID: uuid.New(),
		DivisionID:     uuid.New(),
		Type:           types.TransactionTypeIncome,
		AmountCents:    5000000,
		Currency:       "IDR",
		Description:    "Test transaction",
		Status:         types.TransactionStatusPending,
		RequestedBy:    uuid.New(),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	e := TransactionToEntity(model)

	if e == nil {
		t.Fatal("TransactionToEntity returned nil")
	}

	if e.Amount.AmountCents != 5000000 {
		t.Errorf("Amount.AmountCents = %d, want 5000000", e.Amount.AmountCents)
	}
	if e.Amount.Currency != "IDR" {
		t.Errorf("Amount.Currency = %s, want IDR", e.Amount.Currency)
	}
}

func TestTransactionToEntity_USD(t *testing.T) {
	model := &models.Transaction{
		ID:             uuid.New(),
		OrganizationID: uuid.New(),
		DivisionID:     uuid.New(),
		Type:           types.TransactionTypeExpense,
		AmountCents:    10050,
		Currency:       "USD",
		Description:    "USD transaction",
		Status:         types.TransactionStatusPending,
		RequestedBy:    uuid.New(),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	e := TransactionToEntity(model)

	if e == nil {
		t.Fatal("TransactionToEntity returned nil")
	}

	if e.Amount.AmountCents != 10050 {
		t.Errorf("Amount.AmountCents = %d, want 10050", e.Amount.AmountCents)
	}
	if e.Amount.Currency != "USD" {
		t.Errorf("Amount.Currency = %s, want USD", e.Amount.Currency)
	}
}

func TestTransactionToEntity_EmptyCurrencyDefaultsToIDR(t *testing.T) {
	model := &models.Transaction{
		ID:             uuid.New(),
		OrganizationID: uuid.New(),
		DivisionID:     uuid.New(),
		Type:           types.TransactionTypeIncome,
		AmountCents:    5000000,
		Currency:       "", // Empty currency
		Description:    "Test transaction",
		Status:         types.TransactionStatusPending,
		RequestedBy:    uuid.New(),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	e := TransactionToEntity(model)

	if e.Amount.Currency != "IDR" {
		t.Errorf("Amount.Currency = %s, want IDR (default)", e.Amount.Currency)
	}
}

func TestTransactionToEntity_Nil(t *testing.T) {
	e := TransactionToEntity(nil)
	if e != nil {
		t.Error("TransactionToEntity(nil) should return nil")
	}
}

func TestTransactionRoundTrip(t *testing.T) {
	// Test that entity -> model -> entity preserves data
	originalMoney := valueobject.NewMoney(7500000, "IDR") // 75000.00 IDR
	originalEntity := &domainEntity.Transaction{
		ID:             uuid.New(),
		OrganizationID: uuid.New(),
		DivisionID:     uuid.New(),
		Type:           types.TransactionTypeIncome,
		Amount:         originalMoney,
		Description:    "Round trip test",
		Status:         types.TransactionStatusApproved,
		RequestedBy:    uuid.New(),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	// Convert to model
	model := TransactionToModel(originalEntity)
	if model == nil {
		t.Fatal("TransactionToModel returned nil")
	}

	// Convert back to entity
	resultEntity := TransactionToEntity(model)
	if resultEntity == nil {
		t.Fatal("TransactionToEntity returned nil")
	}

	// Verify data integrity
	if !resultEntity.Amount.Equals(originalMoney) {
		t.Errorf("Amount after round trip = %v, want %v",
			resultEntity.Amount, originalMoney)
	}

	if resultEntity.ID != originalEntity.ID {
		t.Errorf("ID not preserved in round trip")
	}
	if resultEntity.Type != originalEntity.Type {
		t.Errorf("Type not preserved in round trip")
	}
	if resultEntity.Description != originalEntity.Description {
		t.Errorf("Description not preserved in round trip")
	}
}

func TestTransactionRoundTrip_MultiCurrency(t *testing.T) {
	// Test with USD
	originalMoney := valueobject.NewMoney(99999, "USD") // 999.99 USD
	originalEntity := &domainEntity.Transaction{
		ID:             uuid.New(),
		OrganizationID: uuid.New(),
		DivisionID:     uuid.New(),
		Type:           types.TransactionTypeIncome,
		Amount:         originalMoney,
		Description:    "USD round trip test",
		Status:         types.TransactionStatusApproved,
		RequestedBy:    uuid.New(),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	model := TransactionToModel(originalEntity)
	resultEntity := TransactionToEntity(model)

	if !resultEntity.Amount.Equals(originalMoney) {
		t.Errorf("Amount after USD round trip = %v, want %v",
			resultEntity.Amount, originalMoney)
	}
}
