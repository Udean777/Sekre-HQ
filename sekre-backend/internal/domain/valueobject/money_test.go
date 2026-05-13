package valueobject

import (
	"testing"
)

func TestNewMoney(t *testing.T) {
	tests := []struct {
		name        string
		amountCents int64
		currency    string
		want        Money
	}{
		{
			name:        "IDR money",
			amountCents: 5000000,
			currency:    "IDR",
			want:        Money{AmountCents: 5000000, Currency: "IDR"},
		},
		{
			name:        "USD money",
			amountCents: 10050,
			currency:    "USD",
			want:        Money{AmountCents: 10050, Currency: "USD"},
		},
		{
			name:        "zero amount",
			amountCents: 0,
			currency:    "IDR",
			want:        Money{AmountCents: 0, Currency: "IDR"},
		},
		{
			name:        "negative amount",
			amountCents: -5000,
			currency:    "IDR",
			want:        Money{AmountCents: -5000, Currency: "IDR"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := NewMoney(tt.amountCents, tt.currency)
			if got != tt.want {
				t.Errorf("NewMoney() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestNewMoneyFromFloat(t *testing.T) {
	tests := []struct {
		name     string
		amount   float64
		currency string
		want     Money
	}{
		{
			name:     "IDR from float",
			amount:   50000.00,
			currency: "IDR",
			want:     Money{AmountCents: 5000000, Currency: "IDR"},
		},
		{
			name:     "USD from float",
			amount:   100.50,
			currency: "USD",
			want:     Money{AmountCents: 10050, Currency: "USD"},
		},
		{
			name:     "zero amount",
			amount:   0.00,
			currency: "IDR",
			want:     Money{AmountCents: 0, Currency: "IDR"},
		},
		{
			name:     "negative amount",
			amount:   -50.25,
			currency: "USD",
			want:     Money{AmountCents: -5025, Currency: "USD"},
		},
		{
			name:     "rounding test",
			amount:   10.555,
			currency: "USD",
			want:     Money{AmountCents: 1056, Currency: "USD"}, // rounds to 10.56
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := NewMoneyFromFloat(tt.amount, tt.currency)
			if got != tt.want {
				t.Errorf("NewMoneyFromFloat() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestMoney_Add(t *testing.T) {
	tests := []struct {
		name    string
		m       Money
		other   Money
		want    Money
		wantErr bool
	}{
		{
			name:    "add same currency",
			m:       NewMoney(5000000, "IDR"),
			other:   NewMoney(3000000, "IDR"),
			want:    NewMoney(8000000, "IDR"),
			wantErr: false,
		},
		{
			name:    "add different currency",
			m:       NewMoney(5000000, "IDR"),
			other:   NewMoney(10050, "USD"),
			want:    Money{},
			wantErr: true,
		},
		{
			name:    "add zero",
			m:       NewMoney(5000000, "IDR"),
			other:   NewMoney(0, "IDR"),
			want:    NewMoney(5000000, "IDR"),
			wantErr: false,
		},
		{
			name:    "add negative",
			m:       NewMoney(5000000, "IDR"),
			other:   NewMoney(-2000000, "IDR"),
			want:    NewMoney(3000000, "IDR"),
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := tt.m.Add(tt.other)
			if (err != nil) != tt.wantErr {
				t.Errorf("Money.Add() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && got != tt.want {
				t.Errorf("Money.Add() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestMoney_Subtract(t *testing.T) {
	tests := []struct {
		name    string
		m       Money
		other   Money
		want    Money
		wantErr bool
	}{
		{
			name:    "subtract same currency",
			m:       NewMoney(5000000, "IDR"),
			other:   NewMoney(3000000, "IDR"),
			want:    NewMoney(2000000, "IDR"),
			wantErr: false,
		},
		{
			name:    "subtract different currency",
			m:       NewMoney(5000000, "IDR"),
			other:   NewMoney(10050, "USD"),
			want:    Money{},
			wantErr: true,
		},
		{
			name:    "subtract zero",
			m:       NewMoney(5000000, "IDR"),
			other:   NewMoney(0, "IDR"),
			want:    NewMoney(5000000, "IDR"),
			wantErr: false,
		},
		{
			name:    "subtract larger amount",
			m:       NewMoney(3000000, "IDR"),
			other:   NewMoney(5000000, "IDR"),
			want:    NewMoney(-2000000, "IDR"),
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := tt.m.Subtract(tt.other)
			if (err != nil) != tt.wantErr {
				t.Errorf("Money.Subtract() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && got != tt.want {
				t.Errorf("Money.Subtract() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestMoney_Multiply(t *testing.T) {
	tests := []struct {
		name       string
		m          Money
		multiplier float64
		want       Money
	}{
		{
			name:       "multiply by 2",
			m:          NewMoney(5000000, "IDR"),
			multiplier: 2.0,
			want:       NewMoney(10000000, "IDR"),
		},
		{
			name:       "multiply by 0.5",
			m:          NewMoney(5000000, "IDR"),
			multiplier: 0.5,
			want:       NewMoney(2500000, "IDR"),
		},
		{
			name:       "multiply by 0",
			m:          NewMoney(5000000, "IDR"),
			multiplier: 0,
			want:       NewMoney(0, "IDR"),
		},
		{
			name:       "multiply by negative",
			m:          NewMoney(5000000, "IDR"),
			multiplier: -1.0,
			want:       NewMoney(-5000000, "IDR"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.m.Multiply(tt.multiplier)
			if got != tt.want {
				t.Errorf("Money.Multiply() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestMoney_Divide(t *testing.T) {
	tests := []struct {
		name    string
		m       Money
		divisor float64
		want    Money
		wantErr bool
	}{
		{
			name:    "divide by 2",
			m:       NewMoney(5000000, "IDR"),
			divisor: 2.0,
			want:    NewMoney(2500000, "IDR"),
			wantErr: false,
		},
		{
			name:    "divide by 0",
			m:       NewMoney(5000000, "IDR"),
			divisor: 0,
			want:    Money{},
			wantErr: true,
		},
		{
			name:    "divide by negative",
			m:       NewMoney(5000000, "IDR"),
			divisor: -2.0,
			want:    NewMoney(-2500000, "IDR"),
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := tt.m.Divide(tt.divisor)
			if (err != nil) != tt.wantErr {
				t.Errorf("Money.Divide() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && got != tt.want {
				t.Errorf("Money.Divide() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestMoney_ToFloat(t *testing.T) {
	tests := []struct {
		name string
		m    Money
		want float64
	}{
		{
			name: "IDR to float",
			m:    NewMoney(5000000, "IDR"),
			want: 50000.00,
		},
		{
			name: "USD to float",
			m:    NewMoney(10050, "USD"),
			want: 100.50,
		},
		{
			name: "zero to float",
			m:    NewMoney(0, "IDR"),
			want: 0.00,
		},
		{
			name: "negative to float",
			m:    NewMoney(-5025, "USD"),
			want: -50.25,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.m.ToFloat()
			if got != tt.want {
				t.Errorf("Money.ToFloat() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestMoney_String(t *testing.T) {
	tests := []struct {
		name string
		m    Money
		want string
	}{
		{
			name: "IDR string",
			m:    NewMoney(5000000, "IDR"),
			want: "IDR 50000.00",
		},
		{
			name: "USD string",
			m:    NewMoney(10050, "USD"),
			want: "USD 100.50",
		},
		{
			name: "zero string",
			m:    NewMoney(0, "IDR"),
			want: "IDR 0.00",
		},
		{
			name: "negative string",
			m:    NewMoney(-5025, "USD"),
			want: "USD -50.25",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.m.String()
			if got != tt.want {
				t.Errorf("Money.String() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestMoney_IsZero(t *testing.T) {
	tests := []struct {
		name string
		m    Money
		want bool
	}{
		{
			name: "zero amount",
			m:    NewMoney(0, "IDR"),
			want: true,
		},
		{
			name: "positive amount",
			m:    NewMoney(5000000, "IDR"),
			want: false,
		},
		{
			name: "negative amount",
			m:    NewMoney(-5000000, "IDR"),
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.m.IsZero()
			if got != tt.want {
				t.Errorf("Money.IsZero() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestMoney_IsPositive(t *testing.T) {
	tests := []struct {
		name string
		m    Money
		want bool
	}{
		{
			name: "positive amount",
			m:    NewMoney(5000000, "IDR"),
			want: true,
		},
		{
			name: "zero amount",
			m:    NewMoney(0, "IDR"),
			want: false,
		},
		{
			name: "negative amount",
			m:    NewMoney(-5000000, "IDR"),
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.m.IsPositive()
			if got != tt.want {
				t.Errorf("Money.IsPositive() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestMoney_IsNegative(t *testing.T) {
	tests := []struct {
		name string
		m    Money
		want bool
	}{
		{
			name: "negative amount",
			m:    NewMoney(-5000000, "IDR"),
			want: true,
		},
		{
			name: "zero amount",
			m:    NewMoney(0, "IDR"),
			want: false,
		},
		{
			name: "positive amount",
			m:    NewMoney(5000000, "IDR"),
			want: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.m.IsNegative()
			if got != tt.want {
				t.Errorf("Money.IsNegative() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestMoney_Equals(t *testing.T) {
	tests := []struct {
		name  string
		m     Money
		other Money
		want  bool
	}{
		{
			name:  "equal money",
			m:     NewMoney(5000000, "IDR"),
			other: NewMoney(5000000, "IDR"),
			want:  true,
		},
		{
			name:  "different amount",
			m:     NewMoney(5000000, "IDR"),
			other: NewMoney(3000000, "IDR"),
			want:  false,
		},
		{
			name:  "different currency",
			m:     NewMoney(5000000, "IDR"),
			other: NewMoney(5000000, "USD"),
			want:  false,
		},
		{
			name:  "both zero",
			m:     NewMoney(0, "IDR"),
			other: NewMoney(0, "IDR"),
			want:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.m.Equals(tt.other)
			if got != tt.want {
				t.Errorf("Money.Equals() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestMoney_GreaterThan(t *testing.T) {
	tests := []struct {
		name    string
		m       Money
		other   Money
		want    bool
		wantErr bool
	}{
		{
			name:    "greater than",
			m:       NewMoney(5000000, "IDR"),
			other:   NewMoney(3000000, "IDR"),
			want:    true,
			wantErr: false,
		},
		{
			name:    "not greater than",
			m:       NewMoney(3000000, "IDR"),
			other:   NewMoney(5000000, "IDR"),
			want:    false,
			wantErr: false,
		},
		{
			name:    "equal amounts",
			m:       NewMoney(5000000, "IDR"),
			other:   NewMoney(5000000, "IDR"),
			want:    false,
			wantErr: false,
		},
		{
			name:    "different currency",
			m:       NewMoney(5000000, "IDR"),
			other:   NewMoney(10050, "USD"),
			want:    false,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := tt.m.GreaterThan(tt.other)
			if (err != nil) != tt.wantErr {
				t.Errorf("Money.GreaterThan() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && got != tt.want {
				t.Errorf("Money.GreaterThan() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestMoney_LessThan(t *testing.T) {
	tests := []struct {
		name    string
		m       Money
		other   Money
		want    bool
		wantErr bool
	}{
		{
			name:    "less than",
			m:       NewMoney(3000000, "IDR"),
			other:   NewMoney(5000000, "IDR"),
			want:    true,
			wantErr: false,
		},
		{
			name:    "not less than",
			m:       NewMoney(5000000, "IDR"),
			other:   NewMoney(3000000, "IDR"),
			want:    false,
			wantErr: false,
		},
		{
			name:    "equal amounts",
			m:       NewMoney(5000000, "IDR"),
			other:   NewMoney(5000000, "IDR"),
			want:    false,
			wantErr: false,
		},
		{
			name:    "different currency",
			m:       NewMoney(5000000, "IDR"),
			other:   NewMoney(10050, "USD"),
			want:    false,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := tt.m.LessThan(tt.other)
			if (err != nil) != tt.wantErr {
				t.Errorf("Money.LessThan() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && got != tt.want {
				t.Errorf("Money.LessThan() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestMoney_Abs(t *testing.T) {
	tests := []struct {
		name string
		m    Money
		want Money
	}{
		{
			name: "positive amount",
			m:    NewMoney(5000000, "IDR"),
			want: NewMoney(5000000, "IDR"),
		},
		{
			name: "negative amount",
			m:    NewMoney(-5000000, "IDR"),
			want: NewMoney(5000000, "IDR"),
		},
		{
			name: "zero amount",
			m:    NewMoney(0, "IDR"),
			want: NewMoney(0, "IDR"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.m.Abs()
			if got != tt.want {
				t.Errorf("Money.Abs() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestMoney_Negate(t *testing.T) {
	tests := []struct {
		name string
		m    Money
		want Money
	}{
		{
			name: "positive amount",
			m:    NewMoney(5000000, "IDR"),
			want: NewMoney(-5000000, "IDR"),
		},
		{
			name: "negative amount",
			m:    NewMoney(-5000000, "IDR"),
			want: NewMoney(5000000, "IDR"),
		},
		{
			name: "zero amount",
			m:    NewMoney(0, "IDR"),
			want: NewMoney(0, "IDR"),
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.m.Negate()
			if got != tt.want {
				t.Errorf("Money.Negate() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestMoney_Validate(t *testing.T) {
	tests := []struct {
		name    string
		m       Money
		wantErr bool
	}{
		{
			name:    "valid IDR",
			m:       NewMoney(5000000, "IDR"),
			wantErr: false,
		},
		{
			name:    "valid USD",
			m:       NewMoney(10050, "USD"),
			wantErr: false,
		},
		{
			name:    "empty currency",
			m:       NewMoney(5000000, ""),
			wantErr: true,
		},
		{
			name:    "invalid currency length",
			m:       NewMoney(5000000, "ID"),
			wantErr: true,
		},
		{
			name:    "invalid currency length (too long)",
			m:       NewMoney(5000000, "IDRU"),
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.m.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("Money.Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

// Test precision with floating point conversion
func TestMoney_FloatPrecision(t *testing.T) {
	// Test that 0.1 + 0.2 = 0.3 works correctly with Money
	m1 := NewMoneyFromFloat(0.1, "USD")
	m2 := NewMoneyFromFloat(0.2, "USD")
	expected := NewMoneyFromFloat(0.3, "USD")

	result, err := m1.Add(m2)
	if err != nil {
		t.Errorf("Money.Add() error = %v", err)
	}

	if result != expected {
		t.Errorf("Money precision test failed: 0.1 + 0.2 = %v, want %v", result, expected)
	}

	// Verify float conversion
	if result.ToFloat() != 0.3 {
		t.Errorf("Money.ToFloat() = %v, want 0.3", result.ToFloat())
	}
}
