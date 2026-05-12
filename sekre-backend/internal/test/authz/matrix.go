package authz

import (
	"github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/types"
)

// AuthzCase represents a single authorization test case.
type AuthzCase struct {
	Name     string
	Role     types.Role
	Tenant   string // "same" | "other"
	Op       string // "create" | "read" | "update" | "delete" | "list"
	WantErr  error  // Expected error, nil if should succeed
}

// TaskAuthzMatrix defines authorization rules for task operations.
var TaskAuthzMatrix = []AuthzCase{
	// Same-tenant cases
	{"owner same-tenant create",  types.RoleOwner,  "same", "create", nil},
	{"owner same-tenant read",    types.RoleOwner,  "same", "read",   nil},
	{"owner same-tenant update",  types.RoleOwner,  "same", "update", nil},
	{"owner same-tenant delete",  types.RoleOwner,  "same", "delete", nil},
	{"owner same-tenant list",    types.RoleOwner,  "same", "list",   nil},

	{"admin same-tenant create",  types.RoleAdmin,  "same", "create", nil},
	{"admin same-tenant read",    types.RoleAdmin,  "same", "read",   nil},
	{"admin same-tenant update",  types.RoleAdmin,  "same", "update", nil},
	{"admin same-tenant delete",  types.RoleAdmin,  "same", "delete", nil},
	{"admin same-tenant list",    types.RoleAdmin,  "same", "list",   nil},

	{"member same-tenant create", types.RoleMember, "same", "create", errors.ErrForbidden},
	{"member same-tenant read",   types.RoleMember, "same", "read",   nil},
	{"member same-tenant update", types.RoleMember, "same", "update", errors.ErrForbidden},
	{"member same-tenant delete", types.RoleMember, "same", "delete", errors.ErrForbidden},
	{"member same-tenant list",   types.RoleMember, "same", "list",   nil},

	// Cross-tenant cases (ALL should fail with NotFound)
	{"owner cross-tenant read",   types.RoleOwner,  "other", "read",   errors.ErrTaskNotFound},
	{"owner cross-tenant update", types.RoleOwner,  "other", "update", errors.ErrTaskNotFound},
	{"owner cross-tenant delete", types.RoleOwner,  "other", "delete", errors.ErrTaskNotFound},
	{"admin cross-tenant read",   types.RoleAdmin,  "other", "read",   errors.ErrTaskNotFound},
	{"member cross-tenant read",  types.RoleMember, "other", "read",   errors.ErrTaskNotFound},
}

// EventAuthzMatrix defines authorization rules for event operations.
var EventAuthzMatrix = []AuthzCase{
	// Same-tenant cases
	{"owner same-tenant create",  types.RoleOwner,  "same", "create", nil},
	{"owner same-tenant read",    types.RoleOwner,  "same", "read",   nil},
	{"owner same-tenant update",  types.RoleOwner,  "same", "update", nil},
	{"owner same-tenant delete",  types.RoleOwner,  "same", "delete", nil},
	{"owner same-tenant list",    types.RoleOwner,  "same", "list",   nil},

	{"admin same-tenant create",  types.RoleAdmin,  "same", "create", nil},
	{"admin same-tenant read",    types.RoleAdmin,  "same", "read",   nil},
	{"admin same-tenant update",  types.RoleAdmin,  "same", "update", nil},
	{"admin same-tenant delete",  types.RoleAdmin,  "same", "delete", nil},
	{"admin same-tenant list",    types.RoleAdmin,  "same", "list",   nil},

	{"member same-tenant create", types.RoleMember, "same", "create", errors.ErrForbidden},
	{"member same-tenant read",   types.RoleMember, "same", "read",   nil},
	{"member same-tenant update", types.RoleMember, "same", "update", errors.ErrForbidden},
	{"member same-tenant delete", types.RoleMember, "same", "delete", errors.ErrForbidden},
	{"member same-tenant list",   types.RoleMember, "same", "list",   nil},

	// Cross-tenant cases
	{"owner cross-tenant read",   types.RoleOwner,  "other", "read",   errors.ErrEventNotFound},
	{"owner cross-tenant update", types.RoleOwner,  "other", "update", errors.ErrEventNotFound},
	{"owner cross-tenant delete", types.RoleOwner,  "other", "delete", errors.ErrEventNotFound},
	{"admin cross-tenant read",   types.RoleAdmin,  "other", "read",   errors.ErrEventNotFound},
	{"member cross-tenant read",  types.RoleMember, "other", "read",   errors.ErrEventNotFound},
}

// FinanceAuthzMatrix defines authorization rules for finance/transaction operations.
var FinanceAuthzMatrix = []AuthzCase{
	// Same-tenant cases
	{"owner same-tenant create",  types.RoleOwner,  "same", "create", nil},
	{"owner same-tenant read",    types.RoleOwner,  "same", "read",   nil},
	{"owner same-tenant update",  types.RoleOwner,  "same", "update", nil},
	{"owner same-tenant delete",  types.RoleOwner,  "same", "delete", nil},
	{"owner same-tenant list",    types.RoleOwner,  "same", "list",   nil},

	{"admin same-tenant create",  types.RoleAdmin,  "same", "create", nil},
	{"admin same-tenant read",    types.RoleAdmin,  "same", "read",   nil},
	{"admin same-tenant update",  types.RoleAdmin,  "same", "update", nil},
	{"admin same-tenant delete",  types.RoleAdmin,  "same", "delete", nil},
	{"admin same-tenant list",    types.RoleAdmin,  "same", "list",   nil},

	{"member same-tenant create", types.RoleMember, "same", "create", nil}, // Members can request transactions
	{"member same-tenant read",   types.RoleMember, "same", "read",   nil},
	{"member same-tenant update", types.RoleMember, "same", "update", errors.ErrForbidden}, // Only owner/admin can update
	{"member same-tenant delete", types.RoleMember, "same", "delete", errors.ErrForbidden},
	{"member same-tenant list",   types.RoleMember, "same", "list",   nil},

	// Cross-tenant cases
	{"owner cross-tenant read",   types.RoleOwner,  "other", "read",   errors.ErrTransactionNotFound},
	{"owner cross-tenant update", types.RoleOwner,  "other", "update", errors.ErrTransactionNotFound},
	{"owner cross-tenant delete", types.RoleOwner,  "other", "delete", errors.ErrTransactionNotFound},
	{"admin cross-tenant read",   types.RoleAdmin,  "other", "read",   errors.ErrTransactionNotFound},
	{"member cross-tenant read",  types.RoleMember, "other", "read",   errors.ErrTransactionNotFound},
}
