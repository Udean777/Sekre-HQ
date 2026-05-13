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
			name: "IDR transaction",
			request: CreateTransactionRequest{
				AmountCents: 5000000,
				Currency:    "IDR",
			},
			wantAmountCents: 5000000,
			wantCurrency:    "IDR",
		},
		{
			name: "USD transaction",
			request: CreateTransactionRequest{
				AmountCents: 10050,
				Currency:    "USD",
			},
			wantAmountCents: 10050,
			wantCurrency:    "USD",
		},
		{
			name: "empty currency defaults to IDR",
			request: CreateTransactionRequest{
				AmountCents: 5000000,
				// Currency is empty
			},
			wantAmountCents: 5000000,
			wantCurrency:    "IDR",
		},
		{
			name: "zero amount",
			request: CreateTransactionRequest{
				AmountCents: 0,
				Currency:    "IDR",
			},
			wantAmountCents: 0,
			wantCurrency:    "IDR",
		},
		{
			name: "large amount",
			request: CreateTransactionRequest{
				AmountCents: 99999999999,
				Currency:    "IDR",
			},
			wantAmountCents: 99999999999,
			wantCurrency:    "IDR",
		},
		{
			name: "EUR transaction",
			request: CreateTransactionRequest{
				AmountCents: 12345,
				Currency:    "EUR",
			},
			wantAmountCents: 12345,
			wantCurrency:    "EUR",
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
