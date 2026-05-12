package errors

// Predefined errors covering the common cases in the codebase. These replace
// the old flat var block in internal/domain/errors.go. Each one is a
// *DomainError, so callers can use errors.Is / errors.As as usual and the
// delivery layer maps them uniformly.
//
// Conventions:
//   - Use a sentinel when the error has no per-call context (auth rejections,
//     generic "not found", etc.).
//   - For resource-not-found errors that carry an id, prefer constructing a
//     fresh NotFound("user", id) at the call site so id ends up in Details.
var (
	// --- Auth ---

	ErrInvalidCredentials = Unauthorized("invalid email or password")
	ErrInvalidToken       = Unauthorized("invalid or expired token")
	ErrUnauthorized       = Unauthorized("unauthorized")
	ErrSubdomainTaken     = Conflict("subdomain", "unique_subdomain")
	ErrEmailAlreadyExists = Conflict("email", "unique_email")

	// --- Organization ---

	ErrOrganizationNotFound = NotFound("organization", nil)
	ErrUserNotInOrg         = Forbidden("access", "organization")
	ErrUserNotFound         = NotFound("user", nil)

	// --- Generic validation ---

	ErrInvalidInput = New(CodeInvalidInput, "invalid input")
	ErrRequired     = New(CodeInvalidInput, "required field missing")

	// --- Division ---

	ErrDivisionLimitReached       = Precondition("division limit reached for FREE plan")
	ErrMemberLimitReached         = Precondition("member limit reached for division")
	ErrDivisionMemberLimitReached = Precondition("division member limit reached")
	ErrDivisionNotFound           = NotFound("division", nil)
	ErrAlreadyMember              = Conflict("division member", "unique_division_member")
	ErrNotDivisionMember          = Forbidden("access", "division")
	ErrMustHaveHead               = Precondition("division must have at least one HEAD")
	ErrMaxHeadsReached            = Precondition("maximum number of HEADs reached for division")
	ErrCannotRemoveHead           = Precondition("cannot remove HEAD without assigning a new HEAD first")
	ErrDivisionHasData            = Precondition("cannot delete division with active tasks, events, or transactions")
	ErrDivisionHasTasks           = Precondition("cannot delete division with active tasks")
	ErrDivisionHasEvents          = Precondition("cannot delete division with upcoming events")
	ErrDivisionHasFinances        = Precondition("cannot delete division with recent transactions")

	// --- Task ---

	ErrTaskNotFound = NotFound("task", nil)

	// --- Event ---

	ErrEventNotFound    = NotFound("event", nil)
	ErrInvalidTimeRange = InvalidInput("time_range", "end time must be after start time")

	// --- Finance ---

	ErrTransactionNotFound = NotFound("transaction", nil)
	ErrInvalidAmount       = InvalidInput("amount", "must be greater than 0")
	ErrCurrencyMismatch    = InvalidInput("currency", "currency mismatch in operation")
	ErrInvalidCurrency     = InvalidInput("currency", "invalid currency code")
)
