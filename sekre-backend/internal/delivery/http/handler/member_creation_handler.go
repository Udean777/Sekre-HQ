package handler

import (
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/application/organization"
	"github.com/username/sekre-backend/internal/delivery/http/middleware"
	"github.com/username/sekre-backend/internal/domain/entity"
	domainerrors "github.com/username/sekre-backend/internal/domain/errors"
	"github.com/username/sekre-backend/internal/domain/repository"
	"github.com/username/sekre-backend/internal/domain/types"
	"github.com/username/sekre-backend/pkg/logger"
	"github.com/username/sekre-backend/pkg/response"
	"github.com/xuri/excelize/v2"
)

type MemberCreationHandler struct {
	usecase      organization.MemberCreationUsecase
	divisionRepo repository.DivisionRepository
}

func NewMemberCreationHandler(usecase organization.MemberCreationUsecase, divisionRepo repository.DivisionRepository) *MemberCreationHandler {
	return &MemberCreationHandler{usecase: usecase, divisionRepo: divisionRepo}
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
	members, err := parseExcelFile(fileBytes)
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

// DownloadTemplate generates and downloads Excel template with actual divisions from the user's organization.
func (h *MemberCreationHandler) DownloadTemplate(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid organization context"))
		return
	}

	divisions, err := h.divisionRepo.List(r.Context(), orgID)
	if err != nil {
		response.HandleError(w, r, domainerrors.Internal("fetch divisions", err))
		return
	}

	f := excelize.NewFile()
	defer f.Close() //nolint:errcheck

	sheetName := "Members"

	index, err := f.NewSheet(sheetName)
	if err != nil {
		response.HandleError(w, r, domainerrors.Internal("create excel sheet", err))
		return
	}

	if err := f.DeleteSheet("Sheet1"); err != nil {
		logger.Logger.Warn().Err(err).Msg("failed to delete default sheet")
	}

	headerStyle, err := f.NewStyle(&excelize.Style{
		Font: &excelize.Font{Bold: true},
		Fill: excelize.Fill{
			Type: "pattern", Color: []string{"#E0E0E0"}, Pattern: 1,
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

	headers := []string{"Email", "Full Name", "Role", "Division", "Division Role"}
	for i, header := range headers {
		cell := fmt.Sprintf("%c1", 'A'+i)
		if err := f.SetCellValue(sheetName, cell, header); err != nil {
			logger.Logger.Warn().Err(err).Msg("failed to set header cell value")
		}
	}

	divisionRoles := []types.DivisionRole{types.DivisionRoleHead, types.DivisionRoleStaff}
	roles := []types.Role{types.RoleMember, types.RoleAdmin}
	names := []string{"John Doe", "Jane Smith", "Bob Johnson"}
	emails := []string{"john@example.com", "jane@example.com", "bob@example.com"}

	for i := 0; i < 3; i++ {
		rowNum := i + 2
		div := divisions[i%len(divisions)]
		divRole := divisionRoles[rand.Intn(len(divisionRoles))]
		role := roles[rand.Intn(len(roles))]

		f.SetCellValue(sheetName, fmt.Sprintf("A%d", rowNum), emails[i])
		f.SetCellValue(sheetName, fmt.Sprintf("B%d", rowNum), names[i])
		f.SetCellValue(sheetName, fmt.Sprintf("C%d", rowNum), string(role))
		f.SetCellValue(sheetName, fmt.Sprintf("D%d", rowNum), div.Name)
		f.SetCellValue(sheetName, fmt.Sprintf("E%d", rowNum), string(divRole))
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

// PreviewImport parses and validates an Excel file, returning row-level preview
func (h *MemberCreationHandler) PreviewImport(w http.ResponseWriter, r *http.Request) {
	orgID, ok := r.Context().Value(middleware.OrganizationIDKey).(uuid.UUID)
	if !ok {
		response.HandleError(w, r, domainerrors.Unauthorized("invalid organization context"))
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("form", "failed to parse multipart form"))
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("file", "is required"))
		return
	}
	defer file.Close() //nolint:errcheck

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		response.HandleError(w, r, domainerrors.Internal("read uploaded file", err))
		return
	}

	members, err := parseExcelFile(fileBytes)
	if err != nil {
		response.HandleError(w, r, domainerrors.InvalidInput("file", err.Error()))
		return
	}

	result, err := h.usecase.PreviewImport(r.Context(), members, orgID)
	if err != nil {
		response.HandleError(w, r, err)
		return
	}

	response.Success(w, http.StatusOK, "import preview generated", result)
}

// parseExcelFile parses Excel file and returns member requests
func parseExcelFile(fileBytes []byte) ([]entity.BulkImportMemberRequest, error) {
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
