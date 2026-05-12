package handler

import (
	"testing"
)

func TestCreateTransactionRequest_toMoney(t *testing.T) {
	tests := []struct {
		name            string
		request         CreateTransactionRequest
		wantAmountCents int64
		wantCurrency    string
	}{
		{
			name: "legacy format with Amount only (IDR default)",
			request: CreateTransactionRequest{
				Amount: 50000.00,
			},
			wantAmountCents: 5000000,
			wantCurrency:    "IDR",
		},
		{
			name: "new format with AmountCents and Currency",
			request: CreateTransactionRequest{
				AmountCents: int64Ptr(5000000),
				Currency:    "IDR",
			},
			wantAmountCents: 5000000,
			wantCurrency:    "IDR",
		},
		{
			name: "new format USD",
			request: CreateTransactionRequest{
				AmountCents: int64Ptr(10050),
				Currency:    "USD",
			},
			wantAmountCents: 10050,
			wantCurrency:    "USD",
		},
		{
			name: "AmountCents takes precedence over Amount",
			request: CreateTransactionRequest{
				Amount:      100.00, // Should be ignored
				AmountCents: int64Ptr(5000000),
				Currency:    "IDR",
			},
			wantAmountCents: 5000000,
			wantCurrency:    "IDR",
		},
		{
			name: "empty currency defaults to IDR",
			request: CreateTransactionRequest{
				AmountCents: int64Ptr(5000000),
				// Currency is empty
			},
			wantAmountCents: 5000000,
			wantCurrency:    "IDR",
		},
		{
			name: "legacy format with USD currency",
			request: CreateTransactionRequest{
				Amount:   100.50,
				Currency: "USD",
			},
			wantAmountCents: 10050,
			wantCurrency:    "USD",
		},
		{
			name: "zero amount",
			request: CreateTransactionRequest{
				Amount: 0,
			},
			wantAmountCents: 0,
			wantCurrency:    "IDR",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			money := tt.request.toMoney()

			if money.AmountCents != tt.wantAmountCents {
				t.Errorf("AmountCents = %d, want %d", money.AmountCents, tt.wantAmountCents)
			}
			if money.Currency != tt.wantCurrency {
				t.Errorf("Currency = %s, want %s", money.Currency, tt.wantCurrency)
			}
		})
	}
}

func TestCreateTransactionRequest_toMoney_Precision(t *testing.T) {
	// Test that legacy float conversion preserves precision
	request := CreateTransactionRequest{
		Amount:   99.99,
		Currency: "USD",
	}

	money := request.toMoney()

	// 99.99 * 100 = 9999 cents
	if money.AmountCents != 9999 {
		t.Errorf("AmountCents = %d, want 9999", money.AmountCents)
	}

	// Round trip should preserve value
	if money.ToFloat() != 99.99 {
		t.Errorf("ToFloat() = %f, want 99.99", money.ToFloat())
	}
}

func int64Ptr(v int64) *int64 {
	return &v
}
