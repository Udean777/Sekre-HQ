package mapper

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/domain/valueobject"
	"github.com/username/sekre-backend/internal/models"
)

func TestTransactionToModel_WithMoney(t *testing.T) {
	// Test with new Money field
	money := valueobject.NewMoney(5000000, "IDR") // 50000.00 IDR
	entity := &entity.Transaction{
		ID:             uuid.New(),
		OrganizationID: uuid.New(),
		DivisionID:     uuid.New(),
		Type:           types.TransactionTypeIncome,
		AmountMoney:    &money,
		Description:    "Test transaction",
		Status:         types.TransactionStatusPending,
		RequestedBy:    uuid.New(),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	model := TransactionToModel(entity)

	if model == nil {
		t.Fatal("TransactionToModel returned nil")
	}

	// Check dual-write: both old and new fields should be populated
	if model.AmountCents != 5000000 {
		t.Errorf("AmountCents = %d, want 5000000", model.AmountCents)
	}
	if model.Currency != "IDR" {
		t.Errorf("Currency = %s, want IDR", model.Currency)
	}
	if model.Amount != 50000.00 {
		t.Errorf("Amount = %f, want 50000.00", model.Amount)
	}
}

func TestTransactionToModel_WithOldAmount(t *testing.T) {
	// Test with old Amount field (backward compatibility)
	entity := &entity.Transaction{
		ID:             uuid.New(),
		OrganizationID: uuid.New(),
		DivisionID:     uuid.New(),
		Type:           types.TransactionTypeExpense,
		Amount:         25000.00,
		Description:    "Test transaction",
		Status:         types.TransactionStatusPending,
		RequestedBy:    uuid.New(),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	model := TransactionToModel(entity)

	if model == nil {
		t.Fatal("TransactionToModel returned nil")
	}

	// Check that new fields are populated from old field
	if model.Amount != 25000.00 {
		t.Errorf("Amount = %f, want 25000.00", model.Amount)
	}
	if model.AmountCents != 2500000 {
		t.Errorf("AmountCents = %d, want 2500000", model.AmountCents)
	}
	if model.Currency != "IDR" {
		t.Errorf("Currency = %s, want IDR", model.Currency)
	}
}

func TestTransactionToModel_Nil(t *testing.T) {
	model := TransactionToModel(nil)
	if model != nil {
		t.Error("TransactionToModel(nil) should return nil")
	}
}

func TestTransactionToEntity_WithNewFields(t *testing.T) {
	// Test with new amount_cents and currency fields
	model := &models.Transaction{
		ID:             uuid.New(),
		OrganizationID: uuid.New(),
		DivisionID:     uuid.New(),
		Type:           types.TransactionTypeIncome,
		AmountCents:    5000000,
		Currency:       "IDR",
		Amount:         50000.00, // Old field for backward compat
		Description:    "Test transaction",
		Status:         types.TransactionStatusPending,
		RequestedBy:    uuid.New(),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	entity := TransactionToEntity(model)

	if entity == nil {
		t.Fatal("TransactionToEntity returned nil")
	}

	// Check that Money object is created
	if entity.AmountMoney == nil {
		t.Fatal("AmountMoney is nil")
	}
	if entity.AmountMoney.AmountCents != 5000000 {
		t.Errorf("AmountMoney.AmountCents = %d, want 5000000", entity.AmountMoney.AmountCents)
	}
	if entity.AmountMoney.Currency != "IDR" {
		t.Errorf("AmountMoney.Currency = %s, want IDR", entity.AmountMoney.Currency)
	}

	// Check backward compatibility field
	if entity.Amount != 50000.00 {
		t.Errorf("Amount = %f, want 50000.00", entity.Amount)
	}
}

func TestTransactionToEntity_WithOldField(t *testing.T) {
	// Test with only old Amount field (migration scenario)
	model := &models.Transaction{
		ID:             uuid.New(),
		OrganizationID: uuid.New(),
		DivisionID:     uuid.New(),
		Type:           types.TransactionTypeExpense,
		Amount:         25000.00,
		AmountCents:    0, // Not populated yet
		Currency:       "",
		Description:    "Test transaction",
		Status:         types.TransactionStatusPending,
		RequestedBy:    uuid.New(),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	entity := TransactionToEntity(model)

	if entity == nil {
		t.Fatal("TransactionToEntity returned nil")
	}

	// Check that Money object is created from old field
	if entity.AmountMoney == nil {
		t.Fatal("AmountMoney is nil")
	}
	if entity.AmountMoney.AmountCents != 2500000 {
		t.Errorf("AmountMoney.AmountCents = %d, want 2500000", entity.AmountMoney.AmountCents)
	}
	if entity.AmountMoney.Currency != "IDR" {
		t.Errorf("AmountMoney.Currency = %s, want IDR", entity.AmountMoney.Currency)
	}

	// Check backward compatibility field
	if entity.Amount != 25000.00 {
		t.Errorf("Amount = %f, want 25000.00", entity.Amount)
	}
}

func TestTransactionToEntity_Nil(t *testing.T) {
	entity := TransactionToEntity(nil)
	if entity != nil {
		t.Error("TransactionToEntity(nil) should return nil")
	}
}

func TestTransactionToEntity_EmptyCurrency(t *testing.T) {
	// Test that empty currency defaults to IDR
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

	entity := TransactionToEntity(model)

	if entity == nil {
		t.Fatal("TransactionToEntity returned nil")
	}

	if entity.AmountMoney == nil {
		t.Fatal("AmountMoney is nil")
	}

	if entity.AmountMoney.Currency != "IDR" {
		t.Errorf("AmountMoney.Currency = %s, want IDR (default)", entity.AmountMoney.Currency)
	}
}

func TestTransactionRoundTrip(t *testing.T) {
	// Test that entity -> model -> entity preserves data
	originalMoney := valueobject.NewMoney(7500000, "IDR") // 75000.00 IDR
	originalEntity := &entity.Transaction{
		ID:             uuid.New(),
		OrganizationID: uuid.New(),
		DivisionID:     uuid.New(),
		Type:           types.TransactionTypeIncome,
		AmountMoney:    &originalMoney,
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
	if resultEntity.AmountMoney == nil {
		t.Fatal("AmountMoney is nil after round trip")
	}

	if resultEntity.AmountMoney.AmountCents != originalMoney.AmountCents {
		t.Errorf("AmountCents after round trip = %d, want %d",
			resultEntity.AmountMoney.AmountCents, originalMoney.AmountCents)
	}

	if resultEntity.AmountMoney.Currency != originalMoney.Currency {
		t.Errorf("Currency after round trip = %s, want %s",
			resultEntity.AmountMoney.Currency, originalMoney.Currency)
	}

	// Check that Amount field is populated from Money (backward compat)
	expectedAmount := originalMoney.ToFloat()
	if resultEntity.Amount != expectedAmount {
		t.Errorf("Amount after round trip = %f, want %f",
			resultEntity.Amount, expectedAmount)
	}
}

func TestTransactionToModel_MultiCurrency(t *testing.T) {
	// Test with USD currency
	money := valueobject.NewMoney(10050, "USD") // 100.50 USD
	entity := &entity.Transaction{
		ID:             uuid.New(),
		OrganizationID: uuid.New(),
		DivisionID:     uuid.New(),
		Type:           types.TransactionTypeIncome,
		AmountMoney:    &money,
		Description:    "USD transaction",
		Status:         types.TransactionStatusPending,
		RequestedBy:    uuid.New(),
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	model := TransactionToModel(entity)

	if model == nil {
		t.Fatal("TransactionToModel returned nil")
	}

	if model.AmountCents != 10050 {
		t.Errorf("AmountCents = %d, want 10050", model.AmountCents)
	}
	if model.Currency != "USD" {
		t.Errorf("Currency = %s, want USD", model.Currency)
	}
	if model.Amount != 100.50 {
		t.Errorf("Amount = %f, want 100.50", model.Amount)
	}
}
