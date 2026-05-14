package types

// PaginationParams holds pagination parameters for repository queries
type PaginationParams struct {
	Limit  int
	Offset int
}

// PaginationResult holds paginated data with total count
type PaginationResult struct {
	TotalCount int
}

// NewPaginationParams creates pagination params from limit and offset
func NewPaginationParams(limit, offset int) PaginationParams {
	return PaginationParams{
		Limit:  limit,
		Offset: offset,
	}
}
