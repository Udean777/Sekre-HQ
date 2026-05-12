//go:build integration

package scenario

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/models"
	"github.com/username/sekre-backend/internal/test/fixtures"
	"gorm.io/gorm"
)

// MultiTenantScenario represents a test scenario with two organizations and their resources.
// This is the primary fixture for testing multi-tenant isolation.
type MultiTenantScenario struct {
	// Organizations
	OrgA, OrgB models.Organization

	// Users in OrgA
	OwnerA  models.User
	MemberA models.User

	// Users in OrgB
	OwnerB models.User

	// User-Organization relationships
	OwnerAOrg  models.UserOrganization
	MemberAOrg models.UserOrganization
	OwnerBOrg  models.UserOrganization

	// Divisions
	DivisionA models.Division
	DivisionB models.Division

	// Resources in OrgA
	TaskA        models.Task
	EventA       models.Event
	TransactionA models.Transaction

	// Resources in OrgB
	TaskB        models.Task
	EventB       models.Event
	TransactionB models.Transaction
}

// BuildMultiTenant creates a complete multi-tenant test scenario.
// It creates two organizations (A and B), each with users, divisions, and resources.
// This is used to test cross-tenant isolation.
func BuildMultiTenant(t *testing.T, db *gorm.DB) *MultiTenantScenario {
	t.Helper()

	s := &MultiTenantScenario{}

	// Create organizations
	s.OrgA = fixtures.NewOrganization().
		WithName("Organization A").
		WithSubdomain("org-a").
		Build()
	require.NoError(t, db.Create(&s.OrgA).Error)

	s.OrgB = fixtures.NewOrganization().
		WithName("Organization B").
		WithSubdomain("org-b").
		Build()
	require.NoError(t, db.Create(&s.OrgB).Error)

	// Create users for OrgA
	s.OwnerA = fixtures.NewUser().
		WithEmail("owner-a@example.com").
		WithFullName("Owner A").
		Build()
	require.NoError(t, db.Create(&s.OwnerA).Error)

	s.MemberA = fixtures.NewUser().
		WithEmail("member-a@example.com").
		WithFullName("Member A").
		Build()
	require.NoError(t, db.Create(&s.MemberA).Error)

	// Create user for OrgB
	s.OwnerB = fixtures.NewUser().
		WithEmail("owner-b@example.com").
		WithFullName("Owner B").
		Build()
	require.NoError(t, db.Create(&s.OwnerB).Error)

	// Create user-organization relationships
	s.OwnerAOrg = fixtures.NewUserOrganization().
		WithUserID(s.OwnerA.ID).
		WithOrganizationID(s.OrgA.ID).
		WithRole(types.RoleOwner).
		Build()
	require.NoError(t, db.Create(&s.OwnerAOrg).Error)

	s.MemberAOrg = fixtures.NewUserOrganization().
		WithUserID(s.MemberA.ID).
		WithOrganizationID(s.OrgA.ID).
		WithRole(types.RoleMember).
		Build()
	require.NoError(t, db.Create(&s.MemberAOrg).Error)

	s.OwnerBOrg = fixtures.NewUserOrganization().
		WithUserID(s.OwnerB.ID).
		WithOrganizationID(s.OrgB.ID).
		WithRole(types.RoleOwner).
		Build()
	require.NoError(t, db.Create(&s.OwnerBOrg).Error)

	// Create divisions
	s.DivisionA = models.Division{
		ID:             uuid.New(),
		OrganizationID: s.OrgA.ID,
		Name:           "Division A",
	}
	require.NoError(t, db.Create(&s.DivisionA).Error)

	s.DivisionB = models.Division{
		ID:             uuid.New(),
		OrganizationID: s.OrgB.ID,
		Name:           "Division B",
	}
	require.NoError(t, db.Create(&s.DivisionB).Error)

	// Create resources in OrgA
	s.TaskA = fixtures.NewTask().
		WithOrganizationID(s.OrgA.ID).
		WithDivisionID(s.DivisionA.ID).
		WithTitle("Task A").
		Build()
	require.NoError(t, db.Create(&s.TaskA).Error)

	s.EventA = models.Event{
		ID:             uuid.New(),
		OrganizationID: s.OrgA.ID,
		DivisionID:     s.DivisionA.ID,
		Title:          "Event A",
		Description:    "Event in Organization A",
		StartTime:      time.Now().Add(24 * time.Hour),
		EndTime:        time.Now().Add(26 * time.Hour),
		Location:       "Location A",
	}
	require.NoError(t, db.Create(&s.EventA).Error)

	s.TransactionA = models.Transaction{
		ID:             uuid.New(),
		OrganizationID: s.OrgA.ID,
		DivisionID:     s.DivisionA.ID,
		Type:           types.TransactionTypeIncome,
		AmountCents:    100000, // 1000.00
		Currency:       "IDR",
		Description:    "Transaction A",
		Status:         types.TransactionStatusApproved,
		RequestedBy:    s.OwnerA.ID,
	}
	require.NoError(t, db.Create(&s.TransactionA).Error)

	// Create resources in OrgB
	s.TaskB = fixtures.NewTask().
		WithOrganizationID(s.OrgB.ID).
		WithDivisionID(s.DivisionB.ID).
		WithTitle("Task B").
		Build()
	require.NoError(t, db.Create(&s.TaskB).Error)

	s.EventB = models.Event{
		ID:             uuid.New(),
		OrganizationID: s.OrgB.ID,
		DivisionID:     s.DivisionB.ID,
		Title:          "Event B",
		Description:    "Event in Organization B",
		StartTime:      time.Now().Add(24 * time.Hour),
		EndTime:        time.Now().Add(26 * time.Hour),
		Location:       "Location B",
	}
	require.NoError(t, db.Create(&s.EventB).Error)

	s.TransactionB = models.Transaction{
		ID:             uuid.New(),
		OrganizationID: s.OrgB.ID,
		DivisionID:     s.DivisionB.ID,
		Type:           types.TransactionTypeExpense,
		AmountCents:    50000, // 500.00
		Currency:       "IDR",
		Description:    "Transaction B",
		Status:         types.TransactionStatusPending,
		RequestedBy:    s.OwnerB.ID,
	}
	require.NoError(t, db.Create(&s.TransactionB).Error)

	return s
}
