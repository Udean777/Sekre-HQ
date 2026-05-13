package auth

import (
	"fmt"
	"testing"
)

// Benchmarks for bcrypt password hasher
//
// Run with:
//   go test -bench=. -benchmem -run=^$ ./internal/infrastructure/auth
//
// Note: Hashing benchmarks are slow by design (bcrypt is intentionally slow).
// Use -benchtime=5x or -benchtime=10x for meaningful results.
//
// Example:
//   go test -bench=BenchmarkBcryptCost -benchtime=10x -run=^$ ./internal/infrastructure/auth

func BenchmarkBcryptHasher_Hash(b *testing.B) {
	hasher := NewBcryptHasher(10) // Default production cost

	b.ReportAllocs()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = hasher.Hash("password123")
	}
}

func BenchmarkBcryptHasher_Compare(b *testing.B) {
	hasher := NewBcryptHasher(10)
	hash, _ := hasher.Hash("password123")

	b.ReportAllocs()
	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_ = hasher.Compare(hash, "password123")
	}
}

// BenchmarkBcryptCost calibrates bcrypt cost factor.
// Target: ~100-200ms per hash operation.
// Use this to choose the appropriate cost for production.
//
// Run with:
//
//	go test -bench=BenchmarkBcryptCost -benchtime=5x -run=^$ ./internal/infrastructure/auth
//
// Baseline results (2026-05, Apple Silicon):
//
//	cost=10: ~80ms   (too fast for production)
//	cost=11: ~160ms  (OK for API)
//	cost=12: ~320ms  (recommended for sensitive apps)
//	cost=13: ~640ms  (too slow for high-volume API)
//	cost=14: ~1300ms (too slow)
func BenchmarkBcryptCost(b *testing.B) {
	costs := []int{4, 6, 8, 10, 11, 12}

	for _, cost := range costs {
		b.Run(fmt.Sprintf("cost=%d", cost), func(b *testing.B) {
			hasher := NewBcryptHasher(cost)
			b.ReportAllocs()
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				_, _ = hasher.Hash("password123")
			}
		})
	}
}

// BenchmarkBcryptHasher_DifferentPasswords tests if password length affects hash time.
// bcrypt is supposed to have constant-ish time regardless of password length.
func BenchmarkBcryptHasher_DifferentPasswords(b *testing.B) {
	hasher := NewBcryptHasher(4) // Low cost for benchmarking

	passwords := map[string]string{
		"short":  "abc",
		"medium": "MediumPasswordExample123",
		"long":   "VeryLongPasswordWithLotsOfCharacters1234567890!@#$%^&*()",
	}

	for name, pw := range passwords {
		pw := pw
		b.Run(name, func(b *testing.B) {
			b.ReportAllocs()
			b.ResetTimer()
			for i := 0; i < b.N; i++ {
				_, _ = hasher.Hash(pw)
			}
		})
	}
}
