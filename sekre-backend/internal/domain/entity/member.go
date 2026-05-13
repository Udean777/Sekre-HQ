package entity

// CreateMemberRequest represents request to create a new member
type CreateMemberRequest struct {
	Email        string  `json:"email"`
	FullName     string  `json:"full_name"`
	Role         string  `json:"role"`
	DivisionID   *string `json:"division_id,omitempty"`
	DivisionRole *string `json:"division_role,omitempty"`
}

// BulkImportMemberRequest represents a single member in bulk import
type BulkImportMemberRequest struct {
	Email        string `json:"email"`
	FullName     string `json:"full_name"`
	Role         string `json:"role"`
	Division     string `json:"division"`
	DivisionRole string `json:"division_role"`
}

// BulkImportResult represents the result of bulk import
type BulkImportResult struct {
	TotalRows      int                 `json:"total_rows"`
	SuccessCount   int                 `json:"success_count"`
	FailureCount   int                 `json:"failure_count"`
	Errors         []BulkImportError   `json:"errors,omitempty"`
	CreatedMembers []CreatedMemberInfo `json:"created_members"`
}

// BulkImportError represents an error during bulk import
type BulkImportError struct {
	Row     int    `json:"row"`
	Email   string `json:"email"`
	Message string `json:"message"`
}

// CreatedMemberInfo represents info about a created member
type CreatedMemberInfo struct {
	Email             string `json:"email"`
	FullName          string `json:"full_name"`
	TemporaryPassword string `json:"temporary_password"`
	Division          string `json:"division,omitempty"`
}
