package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/application/organization"
	"github.com/username/sekre-backend/internal/delivery/http/middleware"
	"github.com/username/sekre-backend/internal/domain/entity"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/pkg/logger"
	"github.com/username/sekre-backend/pkg/response"
	"github.com/xuri/excelize/v2"
)

type MemberCreationHandler struct {
	usecase organization.MemberCreationUsecase
}

func NewMemberCreationHandler(usecase organization.MemberCreationUsecase) *MemberCreationHandler {
	return &MemberCreationHandler{usecase: usecase}
}

// CreateMember creates a single new member
func (h *MemberCreationHandler) CreateMember(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid organization context"))
		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid user context"))
		return
	}

	var req entity.CreateMemberRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("body", "invalid request body"))
		return
	}

	createdMember, err := h.usecase.CreateMember(r.Context(), req, orgID, userID)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusCreated, "member created successfully", createdMember)
}

// BulkImport imports members from Excel file
func (h *MemberCreationHandler) BulkImport(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid organization context"))
		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid user context"))
		return
	}

	// Parse multipart form (max 10MB)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("form", "failed to parse multipart form"))
		return
	}

	// Get file from form
	file, _, err := r.FormFile("file")
	if err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("file", "is required"))
		return
	}
	defer file.Close() //nolint:errcheck

	// Read file content
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		response.HandleError(w, r, domainerrors.Internal("read uploaded file", err))
		return
	}

	// Parse Excel file
	members, err := h.parseExcelFile(fileBytes)
	if err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("file", err.Error()))
		return
	}

	if len(members) == 0 {
		response.HandleError(w, r, domainerrors.InvalidInput("file", "no valid members found in file"))
		return
	}

	// Import members
	result, err := h.usecase.BulkImportMembers(r.Context(), members, orgID, userID)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "bulk import completed", result)
}

// DownloadTemplate generates and downloads Excel template
func (h *MemberCreationHandler) DownloadTemplate(w http.ResponseWriter, r *http.Request) {
	f := excelize.NewFile()
	defer f.Close() //nolint:errcheck

	sheetName := "Members"

	// Create new sheet
	index, err := f.NewSheet(sheetName)
	if err != nil {
		response.HandleError(w, r, domainerrors.Internal("create excel sheet", err))
		return
	}

	// Delete default Sheet1
	if err := f.DeleteSheet("Sheet1"); err != nil {
		logger.Logger.Warn().Err(err).Msg("failed to delete default sheet")
	}

	// Set headers with bold style
	headerStyle, err := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{
			Bold: true,
		},
		Fill: excelize.Fill{
			Type:    "pattern",
			Color:   []string{"#E0E0E0"},
			Pattern: 1,
		},
	})
	if err == nil {
		for i := 0; i < 5; i++ {
			cell := fmt.Sprintf("%c1", 'A'+i)
			if err := f.SetCellStyle(sheetName, cell, cell, headerStyle); err != nil {
				logger.Logger.Warn().Err(err).Msg("failed to set cell style")
			}
		}
	}

	// Set headers
	headers := []string{"Email", "Full Name", "Role", "Division", "Division Role"}
	for i, header := range headers {
		cell := fmt.Sprintf("%c1", 'A'+i)
		if err := f.SetCellValue(sheetName, cell, header); err != nil {
			logger.Logger.Warn().Err(err).Msg("failed to set header cell value")
		}
	}

	// Add example data. Using typed enum constants keeps the template rows
	// aligned with the accepted Role / DivisionRole values; any future rename
	// of an enum constant will break the build here so the template stays
	// correct.
	examples := [][]string{
		{"john@himti.org", "John Doe", string(types.RoleMember), "IT", string(types.DivisionRoleHead)},
		{"jane@himti.org", "Jane Smith", string(types.RoleMember), "IT", string(types.DivisionRoleStaff)},
		{"bob@himti.org", "Bob Johnson", string(types.RoleAdmin), "Finance", string(types.DivisionRoleHead)},
	}

	for i, example := range examples {
		rowNum := i + 2
		for j, value := range example {
			cell := fmt.Sprintf("%c%d", 'A'+j, rowNum)
			if err := f.SetCellValue(sheetName, cell, value); err != nil {
				logger.Logger.Warn().Err(err).Msg("failed to set example cell value")
			}
		}
	}

	// Set column widths
	colWidths := []struct {
		col   string
		width float64
	}{
		{"A", 25}, {"B", 20}, {"C", 12}, {"D", 15}, {"E", 15},
	}
	for _, cw := range colWidths {
		if err := f.SetColWidth(sheetName, cw.col, cw.col, cw.width); err != nil {
			logger.Logger.Warn().Err(err).Str("col", cw.col).Msg("failed to set column width")
		}
	}

	// Set active sheet
	f.SetActiveSheet(index)

	// Write to response
	w.Header().Set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	w.Header().Set("Content-Disposition", "attachment; filename=member_import_template.xlsx")

	if err := f.Write(w); err != nil {
		response.HandleError(w, r, domainerrors.Internal("write excel file", err))
		return
	}
}

// parseExcelFile parses Excel file and returns member requests
func (h *MemberCreationHandler) parseExcelFile(fileBytes []byte) ([]entity.BulkImportMemberRequest, error) {
	f, err := excelize.OpenReader(strings.NewReader(string(fileBytes)))
	if err != nil {
		return nil, fmt.Errorf("failed to open Excel file: %w", err)
	}
	defer f.Close() //nolint:errcheck

	// Get first sheet
	sheetName := f.GetSheetName(0)
	if sheetName == "" {
		return nil, fmt.Errorf("no sheets found in Excel file")
	}

	// Get all rows
	rows, err := f.GetRows(sheetName)
	if err != nil {
		return nil, fmt.Errorf("failed to read rows: %w", err)
	}

	if len(rows) < 2 {
		return nil, fmt.Errorf("file must contain at least a header row and one data row")
	}

	// Skip header row
	var members []entity.BulkImportMemberRequest
	for i := 1; i < len(rows); i++ {
		row := rows[i]

		// Skip empty rows
		if len(row) == 0 || (len(row) > 0 && strings.TrimSpace(row[0]) == "") {
			continue
		}

		// Ensure row has enough columns
		for len(row) < 5 {
			row = append(row, "")
		}

		member := entity.BulkImportMemberRequest{
			Email:        strings.TrimSpace(row[0]),
			FullName:     strings.TrimSpace(row[1]),
			Role:         strings.ToUpper(strings.TrimSpace(row[2])),
			Division:     strings.TrimSpace(row[3]),
			DivisionRole: strings.ToUpper(strings.TrimSpace(row[4])),
		}

		members = append(members, member)
	}

	return members, nil
}
