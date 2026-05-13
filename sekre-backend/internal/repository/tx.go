package repository

import (
	"context"

	"gorm.io/gorm"
)

// TxRunner wraps a function in a database transaction.
// Any repository call that reads the tx-aware DB via DBFromContext
// will participate in the same transaction.
type TxRunner interface {
	WithTransaction(ctx context.Context, fn func(ctx context.Context) error) error
}

type gormTxRunner struct {
	db *gorm.DB
}

// NewTxRunner returns a GORM-backed TxRunner.
func NewTxRunner(db *gorm.DB) TxRunner {
	return &gormTxRunner{db: db}
}

func (r *gormTxRunner) WithTransaction(ctx context.Context, fn func(ctx context.Context) error) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		return fn(withTx(ctx, tx))
	})
}

type txKey struct{}

func withTx(ctx context.Context, tx *gorm.DB) context.Context {
	return context.WithValue(ctx, txKey{}, tx)
}

// DBFromContext returns the transactional *gorm.DB if present in ctx,
// otherwise returns the fallback DB scoped to ctx.
// Repositories should use this helper to participate in caller's transactions.
func DBFromContext(ctx context.Context, fallback *gorm.DB) *gorm.DB {
	if tx, ok := ctx.Value(txKey{}).(*gorm.DB); ok {
		return tx
	}
	return fallback.WithContext(ctx)
}
