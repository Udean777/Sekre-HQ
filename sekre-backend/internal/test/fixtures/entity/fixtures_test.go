package entityfixtures_test

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/internal/domain/valueobject"
	entityfixtures "github.com/username/sekre-backend/internal/test/fixtures/entity"
)

func TestUserBuilder_Defaults(t *testing.T) {
	t.Parallel()

	user := entityfixtures.NewUser().Build()

	assert.NotEqual(t, uuid.Nil, user.ID)
	assert.Equal(t, "user@example.com", user.Email)
	assert.NotEmpty(t, user.PasswordHash)
	assert.Equal(t, "Test User", user.FullName)
	assert.False(t, user.CreatedAt.IsZero())
}

func TestUserBuilder_Customization(t *testing.T) {
	t.Parallel()

	customID := uuid.New()
	user := entityfixtures.NewUser().
		WithID(customID).
		WithEmail("custom@test.com").
		WithFullName("Custom User").
		WithMustResetPassword(true).
		Build()

	assert.Equal(t, customID, user.ID)
	assert.Equal(t, "custom@test.com", user.Email)
	assert.Equal(t, "Custom User", user.FullName)
	assert.True(t, user.MustResetPassword)
}

func TestUserBuilder_UniqueIDs(t *testing.T) {
	t.Parallel()

	user1 := entityfixtures.NewUser().Build()
	user2 := entityfixtures.NewUser().Build()

	assert.NotEqual(t, user1.ID, user2.ID, "Each builder should generate unique IDs")
}

func TestUserBuilder_BuildPtr(t *testing.T) {
	t.Parallel()

	user := entityfixtures.NewUser().BuildPtr()

	assert.NotNil(t, user)
	assert.NotEqual(t, uuid.Nil, user.ID)
}

func TestOrganizationBuilder_Defaults(t *testing.T) {
	t.Parallel()

	org := entityfixtures.NewOrganization().Build()

	assert.NotEqual(t, uuid.Nil, org.ID)
	assert.Equal(t, "Test Organization", org.Name)
	assert.Equal(t, "test-org", org.Subdomain)
	assert.Equal(t, types.SubscriptionPlanFree, org.SubscriptionPlan)
}

func TestOrganizationBuilder_Customization(t *testing.T) {
	t.Parallel()

	org := entityfixtures.NewOrganization().
		WithName("Custom Org").
		WithSubdomain("custom").
		WithSubscriptionPlan(types.SubscriptionPlanPro).
		Build()

	assert.Equal(t, "Custom Org", org.Name)
	assert.Equal(t, "custom", org.Subdomain)
	assert.Equal(t, types.SubscriptionPlanPro, org.SubscriptionPlan)
}

func TestUserOrganizationBuilder_RoleShortcuts(t *testing.T) {
	t.Parallel()

	owner := entityfixtures.NewUserOrganization().AsOwner().Build()
	admin := entityfixtures.NewUserOrganization().AsAdmin().Build()
	member := entityfixtures.NewUserOrganization().AsMember().Build()

	assert.Equal(t, types.RoleOwner, owner.Role)
	assert.Equal(t, types.RoleAdmin, admin.Role)
	assert.Equal(t, types.RoleMember, member.Role)
}

func TestTaskBuilder_Defaults(t *testing.T) {
	t.Parallel()

	task := entityfixtures.NewTask().Build()

	assert.NotEqual(t, uuid.Nil, task.ID)
	assert.NotEqual(t, uuid.Nil, task.OrganizationID)
	assert.NotEqual(t, uuid.Nil, task.DivisionID)
	assert.Equal(t, "Test Task", task.Title)
	assert.Equal(t, types.TaskStatusTodo, task.Status)
	assert.Nil(t, task.AssigneeID)
	assert.Nil(t, task.DueDate)
}

func TestTaskBuilder_StatusShortcuts(t *testing.T) {
	t.Parallel()

	todo := entityfixtures.NewTask().AsTodo().Build()
	inProgress := entityfixtures.NewTask().AsInProgress().Build()
	done := entityfixtures.NewTask().AsDone().Build()

	assert.Equal(t, types.TaskStatusTodo, todo.Status)
	assert.Equal(t, types.TaskStatusInProgress, inProgress.Status)
	assert.Equal(t, types.TaskStatusDone, done.Status)
}

func TestTaskBuilder_Overdue(t *testing.T) {
	t.Parallel()

	task := entityfixtures.NewTask().Overdue().Build()

	assert.NotNil(t, task.DueDate)
	assert.True(t, task.DueDate.Before(time.Now()), "Overdue task should have due date in past")
}

func TestTaskBuilder_WithDueIn(t *testing.T) {
	t.Parallel()

	task := entityfixtures.NewTask().
		WithDueIn(2 * time.Hour).
		Build()

	assert.NotNil(t, task.DueDate)
	assert.True(t, task.DueDate.After(time.Now()), "Due date should be in future")
}

func TestTaskBuilder_WithAssignee(t *testing.T) {
	t.Parallel()

	assigneeID := uuid.New()
	task := entityfixtures.NewTask().WithAssignee(assigneeID).Build()

	assert.NotNil(t, task.AssigneeID)
	assert.Equal(t, assigneeID, *task.AssigneeID)
}

func TestTransactionBuilder_Defaults(t *testing.T) {
	t.Parallel()

	tx := entityfixtures.NewTransaction().Build()

	assert.NotEqual(t, uuid.Nil, tx.ID)
	assert.Equal(t, types.TransactionTypeIncome, tx.Type)
	assert.Equal(t, int64(100000), tx.Amount.AmountCents)
	assert.Equal(t, "IDR", tx.Amount.Currency)
	assert.Equal(t, types.TransactionStatusApproved, tx.Status)
}

func TestTransactionBuilder_TypeShortcuts(t *testing.T) {
	t.Parallel()

	income := entityfixtures.NewTransaction().AsIncome().Build()
	expense := entityfixtures.NewTransaction().AsExpense().Build()

	assert.Equal(t, types.TransactionTypeIncome, income.Type)
	assert.Equal(t, types.TransactionTypeExpense, expense.Type)
}

func TestTransactionBuilder_StatusShortcuts(t *testing.T) {
	t.Parallel()

	pending := entityfixtures.NewTransaction().AsPending().Build()
	approved := entityfixtures.NewTransaction().AsApproved().Build()
	rejected := entityfixtures.NewTransaction().AsRejected().Build()

	assert.Equal(t, types.TransactionStatusPending, pending.Status)
	assert.Equal(t, types.TransactionStatusApproved, approved.Status)
	assert.Equal(t, types.TransactionStatusRejected, rejected.Status)
}

func TestTransactionBuilder_AmountMethods(t *testing.T) {
	t.Parallel()

	// WithAmountCents
	tx1 := entityfixtures.NewTransaction().WithAmountCents(50000).Build()
	assert.Equal(t, int64(50000), tx1.Amount.AmountCents)

	// WithAmount
	amount := valueobject.NewMoney(75000, "USD")
	tx2 := entityfixtures.NewTransaction().WithAmount(amount).Build()
	assert.Equal(t, int64(75000), tx2.Amount.AmountCents)
	assert.Equal(t, "USD", tx2.Amount.Currency)

	// WithCurrency
	tx3 := entityfixtures.NewTransaction().
		WithAmountCents(100).
		WithCurrency("EUR").
		Build()
	assert.Equal(t, "EUR", tx3.Amount.Currency)
}
