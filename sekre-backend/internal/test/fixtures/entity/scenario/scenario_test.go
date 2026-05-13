package scenario_test

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/test/fixtures/entity/scenario"
)

func TestSingleTenant(t *testing.T) {
	t.Parallel()

	s := scenario.NewSingleTenant()

	// Organization
	assert.NotEqual(t, uuid.Nil, s.Organization.ID)
	assert.Equal(t, "Test Org", s.Organization.Name)

	// Users
	assert.Equal(t, "owner@test.com", s.Owner.Email)
	assert.Equal(t, "admin@test.com", s.Admin.Email)
	assert.Equal(t, "member@test.com", s.Member.Email)

	// Users have unique IDs
	assert.NotEqual(t, s.Owner.ID, s.Admin.ID)
	assert.NotEqual(t, s.Admin.ID, s.Member.ID)

	// Relationships
	assert.Equal(t, s.Owner.ID, s.OwnerOrg.UserID)
	assert.Equal(t, s.Organization.ID, s.OwnerOrg.OrganizationID)
	assert.Equal(t, types.RoleOwner, s.OwnerOrg.Role)

	assert.Equal(t, s.Admin.ID, s.AdminOrg.UserID)
	assert.Equal(t, types.RoleAdmin, s.AdminOrg.Role)

	assert.Equal(t, s.Member.ID, s.MemberOrg.UserID)
	assert.Equal(t, types.RoleMember, s.MemberOrg.Role)
}

func TestMultiTenant(t *testing.T) {
	t.Parallel()

	s := scenario.NewMultiTenant()

	// Two separate orgs
	assert.NotEqual(t, s.OrgA.ID, s.OrgB.ID)
	assert.Equal(t, "Org A", s.OrgA.Name)
	assert.Equal(t, "Org B", s.OrgB.Name)

	// Two separate owners
	assert.NotEqual(t, s.OwnerA.ID, s.OwnerB.ID)

	// Correct relationships
	assert.Equal(t, s.OwnerA.ID, s.OwnerAOrg.UserID)
	assert.Equal(t, s.OrgA.ID, s.OwnerAOrg.OrganizationID)

	assert.Equal(t, s.OwnerB.ID, s.OwnerBOrg.UserID)
	assert.Equal(t, s.OrgB.ID, s.OwnerBOrg.OrganizationID)
}

func TestTaskBoard(t *testing.T) {
	t.Parallel()

	counts := scenario.TaskBoardCounts{
		Todo:       3,
		InProgress: 2,
		Done:       1,
		Overdue:    2,
	}

	board := scenario.NewTaskBoard(counts)

	assert.Len(t, board.TodoTasks, 3)
	assert.Len(t, board.InProgressTasks, 2)
	assert.Len(t, board.DoneTasks, 1)
	assert.Len(t, board.OverdueTasks, 2)

	// Total tasks
	all := board.AllTasks()
	assert.Len(t, all, 8)

	// All tasks share same org and division
	for _, task := range all {
		assert.Equal(t, board.Organization.ID, task.OrganizationID)
		assert.Equal(t, board.DivisionID, task.DivisionID)
	}

	// Verify statuses
	for _, task := range board.TodoTasks {
		assert.Equal(t, types.TaskStatusTodo, task.Status)
	}
	for _, task := range board.InProgressTasks {
		assert.Equal(t, types.TaskStatusInProgress, task.Status)
	}
	for _, task := range board.DoneTasks {
		assert.Equal(t, types.TaskStatusDone, task.Status)
	}
	for _, task := range board.OverdueTasks {
		assert.Equal(t, types.TaskStatusTodo, task.Status)
		assert.NotNil(t, task.DueDate)
	}
}

func TestFinanceLedger(t *testing.T) {
	t.Parallel()

	counts := scenario.LedgerCounts{
		Incomes:  3, // 3 x 100,000 = 300,000
		Expenses: 2, // 2 x 50,000 = 100,000
	}

	ledger := scenario.NewFinanceLedger(counts)

	assert.Len(t, ledger.Incomes, 3)
	assert.Len(t, ledger.Expenses, 2)

	// Totals
	assert.Equal(t, int64(300000), ledger.TotalIncome().AmountCents)
	assert.Equal(t, int64(100000), ledger.TotalExpense().AmountCents)
	assert.Equal(t, int64(200000), ledger.Balance().AmountCents)

	// Currency consistency
	assert.Equal(t, "IDR", ledger.TotalIncome().Currency)
	assert.Equal(t, "IDR", ledger.TotalExpense().Currency)
	assert.Equal(t, "IDR", ledger.Balance().Currency)

	// Verify types
	for _, tx := range ledger.Incomes {
		assert.Equal(t, types.TransactionTypeIncome, tx.Type)
	}
	for _, tx := range ledger.Expenses {
		assert.Equal(t, types.TransactionTypeExpense, tx.Type)
	}
}

func TestFinanceLedger_EmptyLedger(t *testing.T) {
	t.Parallel()

	ledger := scenario.NewFinanceLedger(scenario.LedgerCounts{})

	assert.Len(t, ledger.Incomes, 0)
	assert.Len(t, ledger.Expenses, 0)

	// Zero totals
	assert.Equal(t, int64(0), ledger.TotalIncome().AmountCents)
	assert.Equal(t, int64(0), ledger.TotalExpense().AmountCents)
	assert.Equal(t, int64(0), ledger.Balance().AmountCents)
}

func TestAuthScenario_Default(t *testing.T) {
	t.Parallel()

	s := scenario.NewAuthScenario()

	assert.Equal(t, "authenticated@test.com", s.User.Email)
	assert.NotEqual(t, uuid.Nil, s.Organization.ID)
	assert.Equal(t, types.RoleOwner, s.Role)

	// UserWithOrg is consistent
	assert.Equal(t, s.User.ID, s.UserWithOrg.User.ID)
	assert.Equal(t, s.Organization.ID, s.UserWithOrg.Organization.ID)
	assert.Equal(t, s.Role, s.UserWithOrg.Role)
}

func TestAuthScenario_WithRole(t *testing.T) {
	t.Parallel()

	memberScenario := scenario.NewAuthScenarioWithRole(types.RoleMember)

	assert.Equal(t, types.RoleMember, memberScenario.Role)
	assert.Equal(t, types.RoleMember, memberScenario.UserWithOrg.Role)
}
