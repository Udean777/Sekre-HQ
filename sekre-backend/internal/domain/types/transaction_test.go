package types

import (
	"database/sql/driver"
	"testing"
)

// TransactionType tests

func TestTransactionType_Validate(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		txType  TransactionType
		wantErr bool
	}{
		{"valid income", TransactionTypeIncome, false},
		{"valid expense", TransactionTypeExpense, false},
		{"invalid empty", "", true},
		{"invalid unknown", "TRANSFER", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := tt.txType.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestTransactionType_String(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name   string
		txType TransactionType
		want   string
	}{
		{"income", TransactionTypeIncome, "INCOME"},
		{"expense", TransactionTypeExpense, "EXPENSE"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if got := tt.txType.String(); got != tt.want {
				t.Errorf("String() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestTransactionType_Value(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		txType  TransactionType
		want    driver.Value
		wantErr bool
	}{
		{"valid income", TransactionTypeIncome, "INCOME", false},
		{"invalid type", "INVALID", nil, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := tt.txType.Value()
			if (err != nil) != tt.wantErr {
				t.Errorf("Value() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("Value() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestTransactionType_Scan(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		value   interface{}
		want    TransactionType
		wantErr bool
	}{
		{"scan string income", "INCOME", TransactionTypeIncome, false},
		{"scan bytes expense", []byte("EXPENSE"), TransactionTypeExpense, false},
		{"scan invalid", "INVALID", "", true},
		{"scan nil", nil, "", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			var txType TransactionType
			err := txType.Scan(tt.value)
			if (err != nil) != tt.wantErr {
				t.Errorf("Scan() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if txType != tt.want {
				t.Errorf("Scan() = %v, want %v", txType, tt.want)
			}
		})
	}
}

func TestAllTransactionTypes(t *testing.T) {
	t.Parallel()

	types := AllTransactionTypes()
	if len(types) != 2 {
		t.Errorf("AllTransactionTypes() returned %d types, want 2", len(types))
	}

	for _, txType := range types {
		if err := txType.Validate(); err != nil {
			t.Errorf("AllTransactionTypes() returned invalid type %q: %v", txType, err)
		}
	}
}

// TransactionStatus tests

func TestTransactionStatus_Validate(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		status  TransactionStatus
		wantErr bool
	}{
		{"valid pending", TransactionStatusPending, false},
		{"valid approved", TransactionStatusApproved, false},
		{"valid rejected", TransactionStatusRejected, false},
		{"invalid empty", "", true},
		{"invalid unknown", "CANCELLED", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := tt.status.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestTransactionStatus_String(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name   string
		status TransactionStatus
		want   string
	}{
		{"pending", TransactionStatusPending, "PENDING"},
		{"approved", TransactionStatusApproved, "APPROVED"},
		{"rejected", TransactionStatusRejected, "REJECTED"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if got := tt.status.String(); got != tt.want {
				t.Errorf("String() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestTransactionStatus_Value(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		status  TransactionStatus
		want    driver.Value
		wantErr bool
	}{
		{"valid pending", TransactionStatusPending, "PENDING", false},
		{"invalid status", "INVALID", nil, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := tt.status.Value()
			if (err != nil) != tt.wantErr {
				t.Errorf("Value() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("Value() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestTransactionStatus_Scan(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		value   interface{}
		want    TransactionStatus
		wantErr bool
	}{
		{"scan string pending", "PENDING", TransactionStatusPending, false},
		{"scan bytes approved", []byte("APPROVED"), TransactionStatusApproved, false},
		{"scan invalid", "INVALID", "", true},
		{"scan nil", nil, "", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			var status TransactionStatus
			err := status.Scan(tt.value)
			if (err != nil) != tt.wantErr {
				t.Errorf("Scan() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if status != tt.want {
				t.Errorf("Scan() = %v, want %v", status, tt.want)
			}
		})
	}
}

func TestAllTransactionStatuses(t *testing.T) {
	t.Parallel()

	statuses := AllTransactionStatuses()
	if len(statuses) != 3 {
		t.Errorf("AllTransactionStatuses() returned %d statuses, want 3", len(statuses))
	}

	for _, status := range statuses {
		if err := status.Validate(); err != nil {
			t.Errorf("AllTransactionStatuses() returned invalid status %q: %v", status, err)
		}
	}
}
