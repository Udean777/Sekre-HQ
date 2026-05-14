package seeder

import (
	"context"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/username/sekre-backend/internal/dbctl/domain/service"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/domain/valueobject"
)

// transactionSeeder implements service.Seeder
type transactionSeeder struct {
	db *gorm.DB
}

// NewTransactionSeeder creates new transaction seeder
func NewTransactionSeeder(db *gorm.DB) service.Seeder {
	return &transactionSeeder{db: db}
}

func (s *transactionSeeder) Name() string {
	return "Transactions"
}

func (s *transactionSeeder) Order() int {
	return 6 // After events
}

func (s *transactionSeeder) Seed(ctx context.Context) error {
	requestedBySajudin := uuid.MustParse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
	requestedByZulhamdani := uuid.MustParse("cccccccc-cccc-cccc-cccc-cccccccccccc")
	approvedBySajudin := uuid.MustParse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
	eventID := uuid.MustParse("e1111111-1111-1111-1111-111111111111")

	transactions := []entity.Transaction{
		// Income transactions
		{
			ID:             uuid.MustParse("b1111111-1111-1111-1111-111111111111"),
			OrganizationID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			DivisionID:     uuid.MustParse("d1111111-1111-1111-1111-111111111111"),
			EventID:        nil,
			Type:           types.TransactionTypeIncome,
			Amount:         valueobject.NewMoneyFromFloat(5000000, "IDR"), // Rp 5,000,000
			Description:    "Dana Sponsor Workshop Go Programming",
			Status:         types.TransactionStatusApproved,
			RequestedBy:    requestedBySajudin,
			ApprovedBy:     &approvedBySajudin,
			CreatedAt:      time.Now().AddDate(0, 0, -5),
			UpdatedAt:      time.Now().AddDate(0, 0, -5),
		},
		{
			ID:             uuid.MustParse("b2222222-2222-2222-2222-222222222222"),
			OrganizationID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			DivisionID:     uuid.MustParse("d3333333-3333-3333-3333-333333333333"),
			EventID:        nil,
			Type:           types.TransactionTypeIncome,
			Amount:         valueobject.NewMoneyFromFloat(3000000, "IDR"), // Rp 3,000,000
			Description:    "Hasil Penjualan Merchandise HIMTI",
			Status:         types.TransactionStatusApproved,
			RequestedBy:    requestedBySajudin,
			ApprovedBy:     &approvedBySajudin,
			CreatedAt:      time.Now().AddDate(0, 0, -3),
			UpdatedAt:      time.Now().AddDate(0, 0, -3),
		},
		// Expense transactions
		{
			ID:             uuid.MustParse("b3333333-3333-3333-3333-333333333333"),
			OrganizationID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			DivisionID:     uuid.MustParse("d1111111-1111-1111-1111-111111111111"),
			EventID:        &eventID,
			Type:           types.TransactionTypeExpense,
			Amount:         valueobject.NewMoneyFromFloat(2500000, "IDR"), // Rp 2,500,000
			Description:    "Sewa Venue Workshop + Konsumsi",
			Status:         types.TransactionStatusApproved,
			RequestedBy:    requestedByZulhamdani,
			ApprovedBy:     &approvedBySajudin,
			CreatedAt:      time.Now().AddDate(0, 0, -2),
			UpdatedAt:      time.Now().AddDate(0, 0, -2),
		},
		{
			ID:             uuid.MustParse("b4444444-4444-4444-4444-444444444444"),
			OrganizationID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			DivisionID:     uuid.MustParse("d1111111-1111-1111-1111-111111111111"),
			EventID:        &eventID,
			Type:           types.TransactionTypeExpense,
			Amount:         valueobject.NewMoneyFromFloat(1500000, "IDR"), // Rp 1,500,000
			Description:    "Pembelian Peralatan Workshop (Kabel, Proyektor)",
			Status:         types.TransactionStatusApproved,
			RequestedBy:    requestedBySajudin,
			ApprovedBy:     &approvedBySajudin,
			CreatedAt:      time.Now().AddDate(0, 0, -1),
			UpdatedAt:      time.Now().AddDate(0, 0, -1),
		},
		{
			ID:             uuid.MustParse("b5555555-5555-5555-5555-555555555555"),
			OrganizationID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			DivisionID:     uuid.MustParse("d2222222-2222-2222-2222-222222222222"),
			EventID:        nil,
			Type:           types.TransactionTypeExpense,
			Amount:         valueobject.NewMoneyFromFloat(500000, "IDR"), // Rp 500,000
			Description:    "Biaya Desain Konten Social Media",
			Status:         types.TransactionStatusPending,
			RequestedBy:    requestedByZulhamdani,
			ApprovedBy:     nil,
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		},
		{
			ID:             uuid.MustParse("b6666666-6666-6666-6666-666666666666"),
			OrganizationID: uuid.MustParse("22222222-2222-2222-2222-222222222222"),
			DivisionID:     uuid.MustParse("d4444444-4444-4444-4444-444444444444"),
			EventID:        nil,
			Type:           types.TransactionTypeExpense,
			Amount:         valueobject.NewMoneyFromFloat(2000000, "IDR"), // Rp 2,000,000
			Description:    "Pembelian Sembako untuk Bakti Sosial",
			Status:         types.TransactionStatusApproved,
			RequestedBy:    uuid.MustParse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
			ApprovedBy:     &approvedBySajudin,
			CreatedAt:      time.Now().AddDate(0, 0, -4),
			UpdatedAt:      time.Now().AddDate(0, 0, -4),
		},
	}

	for _, transaction := range transactions {
		if err := s.db.WithContext(ctx).Create(&transaction).Error; err != nil {
			return err
		}
	}

	return nil
}
