package valueobject

import (
	"strings"
	"testing"
)

// Benchmarks for Money operations
//
// Run with:
//   go test -bench=. -benchmem -run=^$ ./internal/domain/valueobject

func BenchmarkMoney_New(b *testing.B) {
	b.ReportAllocs()
	for i := 0; i < b.N; i++ {
		_ = NewMoney(100000, "IDR")
	}
}

func BenchmarkMoney_Add(b *testing.B) {
	a := NewMoney(100000, "IDR")
	c := NewMoney(50000, "IDR")

	b.ReportAllocs()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = a.Add(c)
	}
}

func BenchmarkMoney_Subtract(b *testing.B) {
	a := NewMoney(100000, "IDR")
	c := NewMoney(50000, "IDR")

	b.ReportAllocs()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = a.Subtract(c)
	}
}

func BenchmarkMoney_Multiply(b *testing.B) {
	m := NewMoney(100000, "IDR")

	b.ReportAllocs()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = m.Multiply(1.15)
	}
}

func BenchmarkMoney_Divide(b *testing.B) {
	m := NewMoney(100000, "IDR")

	b.ReportAllocs()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = m.Divide(2.0)
	}
}

func BenchmarkMoney_String(b *testing.B) {
	m := NewMoney(123456789, "IDR")

	b.ReportAllocs()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = m.String()
	}
}

func BenchmarkMoney_Validate(b *testing.B) {
	m := NewMoney(100000, "IDR")

	b.ReportAllocs()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = m.Validate()
	}
}

func BenchmarkMoney_Equals(b *testing.B) {
	m1 := NewMoney(100000, "IDR")
	m2 := NewMoney(100000, "IDR")

	b.ReportAllocs()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = m1.Equals(m2)
	}
}

// Fuzz tests for Money parsing edge cases
//
// Run with:
//   go test -fuzz=FuzzNewMoney -fuzztime=30s ./internal/domain/valueobject

func FuzzNewMoney(f *testing.F) {
	// Seed corpus with edge cases
	f.Add(int64(0), "IDR")
	f.Add(int64(100), "USD")
	f.Add(int64(-100), "EUR")
	f.Add(int64(9223372036854775807), "IDR") // max int64
	f.Add(int64(-9223372036854775808), "IDR") // min int64
	f.Add(int64(0), "")
	f.Add(int64(100), "INVALID")

	f.Fuzz(func(t *testing.T, cents int64, currency string) {
		// Should not panic on any input
		m := NewMoney(cents, currency)

		// AmountCents should match input
		if m.AmountCents != cents {
			t.Errorf("AmountCents mismatch: got %d, want %d", m.AmountCents, cents)
		}

		// Currency should be preserved (or normalized)
		if m.Currency != "" && len(m.Currency) > 10 {
			t.Errorf("Currency too long: %q", m.Currency)
		}

		// Validate should not panic
		_ = m.Validate()

		// String should not panic
		_ = m.String()
	})
}

func FuzzMoney_Add(f *testing.F) {
	// Seed corpus
	f.Add(int64(100), int64(200), "IDR")
	f.Add(int64(0), int64(0), "USD")
	f.Add(int64(9223372036854775807), int64(1), "IDR") // overflow case
	f.Add(int64(-100), int64(50), "EUR")

	f.Fuzz(func(t *testing.T, a, b int64, currency string) {
		// Skip empty currency for this fuzz
		if strings.TrimSpace(currency) == "" {
			return
		}

		m1 := NewMoney(a, currency)
		m2 := NewMoney(b, currency)

		// Add should not panic
		result, err := m1.Add(m2)
		_ = err

		// Result currency should match
		if err == nil && result.Currency != currency {
			t.Errorf("Currency mismatch after Add: got %q, want %q", result.Currency, currency)
		}
	})
}
