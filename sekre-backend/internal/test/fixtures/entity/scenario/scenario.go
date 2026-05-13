// Package scenario provides pre-built test scenarios for common use cases.
// Use these scenarios to reduce boilerplate in tests.
package scenario

import (
	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain/entity"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/domain/valueobject"
	entityfixtures "github.com/username/sekre-backend/internal/test/fixtures/entity"
)

// SingleTenant represents a single organization with owner, admin, and member users.
// Useful for testing role-based authorization within one tenant.
type SingleTenant struct {
	Organization entity.Organization
	Owner        entity.User
	Admin        entity.User
	Member       entity.User

	// Relationships
	OwnerOrg  entity.UserOrganization
	AdminOrg  entity.UserOrganization
	MemberOrg entity.UserOrganization
}

// NewSingleTenant creates a scenario with one org and three users (Owner, Admin, Member).
func NewSingleTenant() *SingleTenant {
	org := entityfixtures.NewOrganization().
		WithName("Test Org").
		Build()

	owner := entityfixtures.NewUser().WithEmail("owner@test.com").Build()
	admin := entityfixtures.NewUser().WithEmail("admin@test.com").Build()
	member := entityfixtures.NewUser().WithEmail("member@test.com").Build()

	return &SingleTenant{
		Organization: org,
		Owner:        owner,
		Admin:        admin,
		Member:       member,
		OwnerOrg: entityfixtures.NewUserOrganization().
			WithUserID(owner.ID).
			WithOrganizationID(org.ID).
			AsOwner().
			Build(),
		AdminOrg: entityfixtures.NewUserOrganization().
			WithUserID(admin.ID).
			WithOrganizationID(org.ID).
			AsAdmin().
			Build(),
		MemberOrg: entityfixtures.NewUserOrganization().
			WithUserID(member.ID).
			WithOrganizationID(org.ID).
			AsMember().
			Build(),
	}
}

// MultiTenant represents two organizations with their respective owners.
// Useful for testing cross-tenant isolation.
type MultiTenant struct {
	OrgA   entity.Organization
	OrgB   entity.Organization
	OwnerA entity.User
	OwnerB entity.User

	// Relationships
	OwnerAOrg entity.UserOrganization
	OwnerBOrg entity.UserOrganization
}

// NewMultiTenant creates a scenario with two separate orgs.
func NewMultiTenant() *MultiTenant {
	orgA := entityfixtures.NewOrganization().
		WithName("Org A").
		WithSubdomain("org-a").
		Build()

	orgB := entityfixtures.NewOrganization().
		WithName("Org B").
		WithSubdomain("org-b").
		Build()

	ownerA := entityfixtures.NewUser().WithEmail("ownera@test.com").Build()
	ownerB := entityfixtures.NewUser().WithEmail("ownerb@test.com").Build()

	return &MultiTenant{
		OrgA:   orgA,
		OrgB:   orgB,
		OwnerA: ownerA,
		OwnerB: ownerB,
		OwnerAOrg: entityfixtures.NewUserOrganization().
			WithUserID(ownerA.ID).
			WithOrganizationID(orgA.ID).
			AsOwner().
			Build(),
		OwnerBOrg: entityfixtures.NewUserOrganization().
			WithUserID(ownerB.ID).
			WithOrganizationID(orgB.ID).
			AsOwner().
			Build(),
	}
}

// TaskBoard represents an organization with multiple tasks in different states.
// Useful for testing task filtering, listing, and status transitions.
type TaskBoard struct {
	Organization entity.Organization
	DivisionID   uuid.UUID
	Owner        entity.User

	TodoTasks       []entity.Task
	InProgressTasks []entity.Task
	DoneTasks       []entity.Task
	OverdueTasks    []entity.Task
}

// NewTaskBoard creates a scenario with a mix of tasks.
// counts specifies how many tasks to create in each state.
type TaskBoardCounts struct {
	Todo       int
	InProgress int
	Done       int
	Overdue    int
}

// NewTaskBoard creates a task board scenario.
func NewTaskBoard(counts TaskBoardCounts) *TaskBoard {
	org := entityfixtures.NewOrganization().Build()
	divisionID := uuid.New()
	owner := entityfixtures.NewUser().Build()

	board := &TaskBoard{
		Organization: org,
		DivisionID:   divisionID,
		Owner:        owner,
		TodoTasks:    make([]entity.Task, 0, counts.Todo),
		InProgressTasks: make([]entity.Task, 0, counts.InProgress),
		DoneTasks:       make([]entity.Task, 0, counts.Done),
		OverdueTasks:    make([]entity.Task, 0, counts.Overdue),
	}

	for i := 0; i < counts.Todo; i++ {
		board.TodoTasks = append(board.TodoTasks,
			entityfixtures.NewTask().
				WithOrganizationID(org.ID).
				WithDivisionID(divisionID).
				AsTodo().
				Build(),
		)
	}

	for i := 0; i < counts.InProgress; i++ {
		board.InProgressTasks = append(board.InProgressTasks,
			entityfixtures.NewTask().
				WithOrganizationID(org.ID).
				WithDivisionID(divisionID).
				AsInProgress().
				Build(),
		)
	}

	for i := 0; i < counts.Done; i++ {
		board.DoneTasks = append(board.DoneTasks,
			entityfixtures.NewTask().
				WithOrganizationID(org.ID).
				WithDivisionID(divisionID).
				AsDone().
				Build(),
		)
	}

	for i := 0; i < counts.Overdue; i++ {
		board.OverdueTasks = append(board.OverdueTasks,
			entityfixtures.NewTask().
				WithOrganizationID(org.ID).
				WithDivisionID(divisionID).
				AsTodo().
				Overdue().
				Build(),
		)
	}

	return board
}

// AllTasks returns all tasks combined.
func (b *TaskBoard) AllTasks() []entity.Task {
	total := len(b.TodoTasks) + len(b.InProgressTasks) + len(b.DoneTasks) + len(b.OverdueTasks)
	all := make([]entity.Task, 0, total)
	all = append(all, b.TodoTasks...)
	all = append(all, b.InProgressTasks...)
	all = append(all, b.DoneTasks...)
	all = append(all, b.OverdueTasks...)
	return all
}

// FinanceLedger represents an organization with income and expense transactions.
// Useful for testing financial summaries and balance calculations.
type FinanceLedger struct {
	Organization entity.Organization
	DivisionID   uuid.UUID
	Currency     string

	Incomes  []entity.Transaction
	Expenses []entity.Transaction
}

// LedgerCounts specifies transaction counts by type.
type LedgerCounts struct {
	Incomes  int
	Expenses int
}

// NewFinanceLedger creates a finance ledger scenario.
// Each income is 100,000 IDR and each expense is 50,000 IDR by default.
func NewFinanceLedger(counts LedgerCounts) *FinanceLedger {
	org := entityfixtures.NewOrganization().Build()
	divisionID := uuid.New()

	ledger := &FinanceLedger{
		Organization: org,
		DivisionID:   divisionID,
		Currency:     "IDR",
		Incomes:      make([]entity.Transaction, 0, counts.Incomes),
		Expenses:     make([]entity.Transaction, 0, counts.Expenses),
	}

	for i := 0; i < counts.Incomes; i++ {
		ledger.Incomes = append(ledger.Incomes,
			entityfixtures.NewTransaction().
				WithOrganizationID(org.ID).
				WithDivisionID(divisionID).
				AsIncome().
				WithAmountCents(100000).
				Build(),
		)
	}

	for i := 0; i < counts.Expenses; i++ {
		ledger.Expenses = append(ledger.Expenses,
			entityfixtures.NewTransaction().
				WithOrganizationID(org.ID).
				WithDivisionID(divisionID).
				AsExpense().
				WithAmountCents(50000).
				Build(),
		)
	}

	return ledger
}

// TotalIncome returns the sum of all income transactions.
func (l *FinanceLedger) TotalIncome() valueobject.Money {
	var totalCents int64
	for _, tx := range l.Incomes {
		totalCents += tx.Amount.AmountCents
	}
	return valueobject.NewMoney(totalCents, l.Currency)
}

// TotalExpense returns the sum of all expense transactions.
func (l *FinanceLedger) TotalExpense() valueobject.Money {
	var totalCents int64
	for _, tx := range l.Expenses {
		totalCents += tx.Amount.AmountCents
	}
	return valueobject.NewMoney(totalCents, l.Currency)
}

// Balance returns income minus expenses.
func (l *FinanceLedger) Balance() valueobject.Money {
	return valueobject.NewMoney(
		l.TotalIncome().AmountCents-l.TotalExpense().AmountCents,
		l.Currency,
	)
}

// AuthScenario represents a ready-to-use auth test setup.
type AuthScenario struct {
	User         entity.User
	Organization entity.Organization
	Role         types.Role
	UserWithOrg  entity.UserWithOrganization
}

// NewAuthScenario creates an auth scenario with an owner user.
func NewAuthScenario() *AuthScenario {
	user := entityfixtures.NewUser().
		WithEmail("authenticated@test.com").
		Build()

	org := entityfixtures.NewOrganization().Build()

	return &AuthScenario{
		User:         user,
		Organization: org,
		Role:         types.RoleOwner,
		UserWithOrg: entityfixtures.NewUserWithOrganization().
			WithUser(user).
			WithOrganization(org).
			WithRole(types.RoleOwner).
			Build(),
	}
}

// NewAuthScenarioWithRole creates an auth scenario with specified role.
func NewAuthScenarioWithRole(role types.Role) *AuthScenario {
	s := NewAuthScenario()
	s.Role = role
	s.UserWithOrg.Role = role
	return s
}
