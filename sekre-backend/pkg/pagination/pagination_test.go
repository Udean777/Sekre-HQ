package pagination

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestParseParams(t *testing.T) {
	tests := []struct {
		name         string
		queryParams  string
		expectedPage int
		expectedSize int
	}{
		{
			name:         "default values when no params",
			queryParams:  "",
			expectedPage: 1,
			expectedSize: DefaultPageSize,
		},
		{
			name:         "valid page and page_size",
			queryParams:  "page=2&page_size=50",
			expectedPage: 2,
			expectedSize: 50,
		},
		{
			name:         "page below minimum defaults to 1",
			queryParams:  "page=0&page_size=20",
			expectedPage: 1,
			expectedSize: 20,
		},
		{
			name:         "page_size below minimum defaults to MinPageSize",
			queryParams:  "page=1&page_size=0",
			expectedPage: 1,
			expectedSize: MinPageSize,
		},
		{
			name:         "page_size above maximum capped to MaxPageSize",
			queryParams:  "page=1&page_size=200",
			expectedPage: 1,
			expectedSize: MaxPageSize,
		},
		{
			name:         "invalid page defaults to 1",
			queryParams:  "page=invalid&page_size=20",
			expectedPage: 1,
			expectedSize: 20,
		},
		{
			name:         "invalid page_size defaults to DefaultPageSize",
			queryParams:  "page=2&page_size=invalid",
			expectedPage: 2,
			expectedSize: DefaultPageSize,
		},
		{
			name:         "negative page defaults to 1",
			queryParams:  "page=-5&page_size=20",
			expectedPage: 1,
			expectedSize: 20,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(http.MethodGet, "/test?"+tt.queryParams, nil)
			params := ParseParams(req)

			if params.Page != tt.expectedPage {
				t.Errorf("expected page %d, got %d", tt.expectedPage, params.Page)
			}
			if params.PageSize != tt.expectedSize {
				t.Errorf("expected page_size %d, got %d", tt.expectedSize, params.PageSize)
			}
		})
	}
}

func TestParams_Offset(t *testing.T) {
	tests := []struct {
		name           string
		page           int
		pageSize       int
		expectedOffset int
	}{
		{
			name:           "first page",
			page:           1,
			pageSize:       20,
			expectedOffset: 0,
		},
		{
			name:           "second page",
			page:           2,
			pageSize:       20,
			expectedOffset: 20,
		},
		{
			name:           "third page with custom page size",
			page:           3,
			pageSize:       50,
			expectedOffset: 100,
		},
		{
			name:           "page 10",
			page:           10,
			pageSize:       10,
			expectedOffset: 90,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			params := Params{
				Page:     tt.page,
				PageSize: tt.pageSize,
			}

			offset := params.Offset()
			if offset != tt.expectedOffset {
				t.Errorf("expected offset %d, got %d", tt.expectedOffset, offset)
			}
		})
	}
}

func TestParams_Limit(t *testing.T) {
	params := Params{
		Page:     2,
		PageSize: 50,
	}

	if params.Limit() != 50 {
		t.Errorf("expected limit 50, got %d", params.Limit())
	}
}

func TestNewMetadata(t *testing.T) {
	tests := []struct {
		name           string
		params         Params
		totalItems     int
		expectedPages  int
		expectedPage   int
		expectedSize   int
		expectedTotal  int
	}{
		{
			name: "exact division",
			params: Params{
				Page:     1,
				PageSize: 20,
			},
			totalItems:    100,
			expectedPages: 5,
			expectedPage:  1,
			expectedSize:  20,
			expectedTotal: 100,
		},
		{
			name: "with remainder",
			params: Params{
				Page:     2,
				PageSize: 20,
			},
			totalItems:    95,
			expectedPages: 5,
			expectedPage:  2,
			expectedSize:  20,
			expectedTotal: 95,
		},
		{
			name: "single page",
			params: Params{
				Page:     1,
				PageSize: 50,
			},
			totalItems:    30,
			expectedPages: 1,
			expectedPage:  1,
			expectedSize:  50,
			expectedTotal: 30,
		},
		{
			name: "empty result",
			params: Params{
				Page:     1,
				PageSize: 20,
			},
			totalItems:    0,
			expectedPages: 1,
			expectedPage:  1,
			expectedSize:  20,
			expectedTotal: 0,
		},
		{
			name: "large dataset",
			params: Params{
				Page:     5,
				PageSize: 100,
			},
			totalItems:    1234,
			expectedPages: 13,
			expectedPage:  5,
			expectedSize:  100,
			expectedTotal: 1234,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			metadata := NewMetadata(tt.params, tt.totalItems)

			if metadata.Page != tt.expectedPage {
				t.Errorf("expected page %d, got %d", tt.expectedPage, metadata.Page)
			}
			if metadata.PageSize != tt.expectedSize {
				t.Errorf("expected page_size %d, got %d", tt.expectedSize, metadata.PageSize)
			}
			if metadata.TotalItems != tt.expectedTotal {
				t.Errorf("expected total_items %d, got %d", tt.expectedTotal, metadata.TotalItems)
			}
			if metadata.TotalPages != tt.expectedPages {
				t.Errorf("expected total_pages %d, got %d", tt.expectedPages, metadata.TotalPages)
			}
		})
	}
}

func TestNewResponse(t *testing.T) {
	data := []string{"item1", "item2", "item3"}
	params := Params{
		Page:     1,
		PageSize: 20,
	}
	totalItems := 50

	response := NewResponse(data, params, totalItems)

	// Check data
	dataSlice, ok := response.Data.([]string)
	if !ok {
		t.Fatal("expected data to be []string")
	}
	if len(dataSlice) != 3 {
		t.Errorf("expected 3 items, got %d", len(dataSlice))
	}

	// Check pagination metadata
	if response.Pagination.Page != 1 {
		t.Errorf("expected page 1, got %d", response.Pagination.Page)
	}
	if response.Pagination.PageSize != 20 {
		t.Errorf("expected page_size 20, got %d", response.Pagination.PageSize)
	}
	if response.Pagination.TotalItems != 50 {
		t.Errorf("expected total_items 50, got %d", response.Pagination.TotalItems)
	}
	if response.Pagination.TotalPages != 3 {
		t.Errorf("expected total_pages 3, got %d", response.Pagination.TotalPages)
	}
}
