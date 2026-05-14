package pagination

import (
	"math"
	"net/http"
	"strconv"
)

const (
	// DefaultPageSize is the default number of items per page
	DefaultPageSize = 20

	// MaxPageSize is the maximum allowed page size to prevent abuse
	MaxPageSize = 100

	// MinPageSize is the minimum page size
	MinPageSize = 1
)

// Params holds pagination parameters from request
type Params struct {
	Page     int
	PageSize int
}

// Metadata holds pagination metadata for response
type Metadata struct {
	Page       int `json:"page"`
	PageSize   int `json:"page_size"`
	TotalItems int `json:"total_items"`
	TotalPages int `json:"total_pages"`
}

// Response wraps data with pagination metadata
type Response struct {
	Data       interface{} `json:"data"`
	Pagination Metadata    `json:"pagination"`
}

// ParseParams extracts pagination parameters from HTTP request
// Returns default values if parameters are missing or invalid
func ParseParams(r *http.Request) Params {
	page := parseIntParam(r, "page", 1)
	pageSize := parseIntParam(r, "page_size", DefaultPageSize)

	// Validate and constrain values
	if page < 1 {
		page = 1
	}

	if pageSize < MinPageSize {
		pageSize = MinPageSize
	}
	if pageSize > MaxPageSize {
		pageSize = MaxPageSize
	}

	return Params{
		Page:     page,
		PageSize: pageSize,
	}
}

// Offset calculates the database offset for the current page
func (p Params) Offset() int {
	return (p.Page - 1) * p.PageSize
}

// Limit returns the page size (for clarity in queries)
func (p Params) Limit() int {
	return p.PageSize
}

// NewMetadata creates pagination metadata from params and total count
func NewMetadata(params Params, totalItems int) Metadata {
	totalPages := int(math.Ceil(float64(totalItems) / float64(params.PageSize)))
	if totalPages < 1 {
		totalPages = 1
	}

	return Metadata{
		Page:       params.Page,
		PageSize:   params.PageSize,
		TotalItems: totalItems,
		TotalPages: totalPages,
	}
}

// NewResponse creates a paginated response
func NewResponse(data interface{}, params Params, totalItems int) Response {
	return Response{
		Data:       data,
		Pagination: NewMetadata(params, totalItems),
	}
}

// parseIntParam extracts an integer query parameter with a default value
func parseIntParam(r *http.Request, key string, defaultValue int) int {
	valueStr := r.URL.Query().Get(key)
	if valueStr == "" {
		return defaultValue
	}

	value, err := strconv.Atoi(valueStr)
	if err != nil {
		return defaultValue
	}

	return value
}
