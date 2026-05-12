package usecase

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain"
	"github.com/username/sekre-backend/internal/organization/repository"
	"github.com/username/sekre-backend/pkg/password"
	"golang.org/x/crypto/bcrypt"
)

const (
	MaxMembersPerDivision = 10
	DefaultTemporaryPassword = "password123"
)

type MemberCreationUsecase interface {
	CreateMember(ctx context.Context, req domain.CreateMemberRequest, orgID, actorID uuid.UUID) (*domain.CreatedMemberInfo, error)
	BulkImportMembers(ctx context.Context, members []domain.BulkImportMemberRequest, orgID, actorID uuid.UUID) (*domain.BulkImportResult, error)
}

type memberCreationUsecase struct {
	memberRepo   repository.MemberRepository
	divisionRepo repository.DivisionRepository
}

func NewMemberCreationUsecase(memberRepo repository.MemberRepository, divisionRepo repository.DivisionRepository) MemberCreationUsecase {
	return &memberCreationUsecase{
		memberRepo:   memberRepo,
		divisionRepo: divisionRepo,
	}
}

// CreateMember creates a single new member
func (u *memberCreationUsecase) CreateMember(ctx context.Context, req domain.CreateMemberRequest, orgID, actorID uuid.UUID) (*domain.CreatedMemberInfo, error) {
	// Validate input
	if err := u.validateMemberRequest(req); err != nil {
		return nil, err
	}

	// Generate temporary password
	tempPassword, err := password.GenerateTemporaryPassword()
	if err != nil {
		return nil, fmt.Errorf("failed to generate password: %w", err)
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(tempPassword), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	user := &domain.User{
		ID:                uuid.New(),
		Email:             strings.ToLower(strings.TrimSpace(req.Email)),
		PasswordHash:      string(hashedPassword),
		FullName:          strings.TrimSpace(req.FullName),
		MustResetPassword: true,
	}

	// Create member in organization
	if err := u.memberRepo.CreateMember(ctx, user, orgID, req.Role); err != nil {
		if strings.Contains(err.Error(), "duplicate key") {
			return nil, errors.New("email already exists")
		}
		return nil, fmt.Errorf("failed to create member: %w", err)
	}

	result := &domain.CreatedMemberInfo{
		Email:             user.Email,
		FullName:          user.FullName,
		TemporaryPassword: tempPassword,
	}

	// Add to division if specified
	if req.DivisionID != nil && *req.DivisionID != "" {
		divisionUUID, err := uuid.Parse(*req.DivisionID)
		if err != nil {
			return nil, errors.New("invalid division ID")
		}

		// Check division member limit
		memberCount, err := u.divisionRepo.CountMembers(ctx, divisionUUID)
		if err != nil {
			return nil, fmt.Errorf("failed to check division members: %w", err)
		}
		if memberCount >= MaxMembersPerDivision {
			return nil, fmt.Errorf("division has reached maximum member limit (%d)", MaxMembersPerDivision)
		}

		// Check if HEAD role and validate only one HEAD per division
		divRole := "STAFF"
		if req.DivisionRole != nil {
			divRole = *req.DivisionRole
		}
		
		if divRole == "HEAD" {
			headCount, err := u.divisionRepo.CountHeads(ctx, divisionUUID)
			if err != nil {
				return nil, fmt.Errorf("failed to check division heads: %w", err)
			}
			if headCount > 0 {
				return nil, errors.New("division already has a HEAD, only one HEAD is allowed per division")
			}
		}

		// Add to division
		if err := u.memberRepo.AddMemberToDivision(ctx, divisionUUID, user.ID, divRole); err != nil {
			return nil, fmt.Errorf("failed to add member to division: %w", err)
		}

		// Get division name for result
		division, err := u.divisionRepo.GetByID(ctx, divisionUUID)
		if err == nil {
			result.Division = division.Name
		}
	}

	// Create audit log
	auditLog := &domain.AuditLog{
		ID:             uuid.New(),
		OrganizationID: orgID,
		UserID:         actorID,
		Action:         "MEMBER_ADDED",
		TargetUserID:   &user.ID,
		Details: map[string]interface{}{
			"email":     user.Email,
			"full_name": user.FullName,
			"role":      req.Role,
		},
	}
	if err := u.memberRepo.CreateAuditLog(ctx, auditLog); err != nil {
		// Log error but don't fail the operation
		fmt.Printf("Failed to create audit log: %v\n", err)
	}

	return result, nil
}

// BulkImportMembers imports multiple members from Excel
func (u *memberCreationUsecase) BulkImportMembers(ctx context.Context, members []domain.BulkImportMemberRequest, orgID, actorID uuid.UUID) (*domain.BulkImportResult, error) {
	result := &domain.BulkImportResult{
		TotalRows:      len(members),
		SuccessCount:   0,
		FailureCount:   0,
		Errors:         []domain.BulkImportError{},
		CreatedMembers: []domain.CreatedMemberInfo{},
	}

	// Track divisions and their HEAD count
	divisionHeads := make(map[string]int)
	divisionMembers := make(map[string]int)

	// Pre-validate divisions and count existing HEADs
	for _, member := range members {
		if member.Division != "" {
			division, err := u.memberRepo.GetDivisionByName(ctx, orgID, member.Division)
			if err != nil {
				continue
			}
			
			// Count existing members
			if _, exists := divisionMembers[member.Division]; !exists {
				count, err := u.divisionRepo.CountMembers(ctx, division.ID)
				if err == nil {
					divisionMembers[member.Division] = count
				}
			}
			
			// Count existing HEADs
			if _, exists := divisionHeads[member.Division]; !exists {
				count, err := u.divisionRepo.CountHeads(ctx, division.ID)
				if err == nil {
					divisionHeads[member.Division] = count
				}
			}
		}
	}

	// Process each member
	for i, member := range members {
		rowNum := i + 2 // Excel row number (1-indexed + header row)

		// Validate
		if err := u.validateBulkMemberRequest(member); err != nil {
			result.FailureCount++
			result.Errors = append(result.Errors, domain.BulkImportError{
				Row:     rowNum,
				Email:   member.Email,
				Message: err.Error(),
			})
			continue
		}

		// Check division member limit
		if member.Division != "" {
			if count, exists := divisionMembers[member.Division]; exists {
				if count >= MaxMembersPerDivision {
					result.FailureCount++
					result.Errors = append(result.Errors, domain.BulkImportError{
						Row:     rowNum,
						Email:   member.Email,
						Message: fmt.Sprintf("division '%s' has reached maximum member limit (%d)", member.Division, MaxMembersPerDivision),
					})
					continue
				}
			}
		}

		// Check HEAD constraint
		if member.DivisionRole == "HEAD" {
			if count, exists := divisionHeads[member.Division]; exists && count > 0 {
				result.FailureCount++
				result.Errors = append(result.Errors, domain.BulkImportError{
					Row:     rowNum,
					Email:   member.Email,
					Message: fmt.Sprintf("division '%s' already has a HEAD", member.Division),
				})
				continue
			}
			// Increment HEAD count for this division
			divisionHeads[member.Division]++
		}

		// Create member
		divisionID := ""
		if member.Division != "" {
			division, err := u.memberRepo.GetDivisionByName(ctx, orgID, member.Division)
			if err != nil {
				result.FailureCount++
				result.Errors = append(result.Errors, domain.BulkImportError{
					Row:     rowNum,
					Email:   member.Email,
					Message: fmt.Sprintf("division '%s' not found", member.Division),
				})
				continue
			}
			divisionID = division.ID.String()
		}

		divRole := member.DivisionRole
		req := domain.CreateMemberRequest{
			Email:        member.Email,
			FullName:     member.FullName,
			Role:         member.Role,
			DivisionID:   &divisionID,
			DivisionRole: &divRole,
		}

		createdMember, err := u.CreateMember(ctx, req, orgID, actorID)
		if err != nil {
			result.FailureCount++
			result.Errors = append(result.Errors, domain.BulkImportError{
				Row:     rowNum,
				Email:   member.Email,
				Message: err.Error(),
			})
			continue
		}

		result.SuccessCount++
		result.CreatedMembers = append(result.CreatedMembers, *createdMember)
		
		// Increment division member count
		if member.Division != "" {
			divisionMembers[member.Division]++
		}
	}

	// Create bulk import audit log
	auditLog := &domain.AuditLog{
		ID:             uuid.New(),
		OrganizationID: orgID,
		UserID:         actorID,
		Action:         "MEMBERS_BULK_IMPORTED",
		Details: map[string]interface{}{
			"total_rows":    result.TotalRows,
			"success_count": result.SuccessCount,
			"failure_count": result.FailureCount,
		},
	}
	if err := u.memberRepo.CreateAuditLog(ctx, auditLog); err != nil {
		fmt.Printf("Failed to create audit log: %v\n", err)
	}

	return result, nil
}

// validateMemberRequest validates a single member creation request
func (u *memberCreationUsecase) validateMemberRequest(req domain.CreateMemberRequest) error {
	if req.Email == "" {
		return errors.New("email is required")
	}
	if req.FullName == "" {
		return errors.New("full name is required")
	}
	if req.Role == "" {
		return errors.New("role is required")
	}

	// Validate role
	validRoles := map[string]bool{"OWNER": true, "ADMIN": true, "MEMBER": true}
	if !validRoles[req.Role] {
		return errors.New("invalid role, must be OWNER, ADMIN, or MEMBER")
	}

	// Validate division role if provided
	if req.DivisionRole != nil && *req.DivisionRole != "" {
		validDivRoles := map[string]bool{"HEAD": true, "STAFF": true}
		if !validDivRoles[*req.DivisionRole] {
			return errors.New("invalid division role, must be HEAD or STAFF")
		}
	}

	// Basic email validation
	if !strings.Contains(req.Email, "@") {
		return errors.New("invalid email format")
	}

	return nil
}

// validateBulkMemberRequest validates a bulk import member request
func (u *memberCreationUsecase) validateBulkMemberRequest(req domain.BulkImportMemberRequest) error {
	if req.Email == "" {
		return errors.New("email is required")
	}
	if req.FullName == "" {
		return errors.New("full name is required")
	}
	if req.Role == "" {
		return errors.New("role is required")
	}
	if req.Division == "" {
		return errors.New("division is required")
	}
	if req.DivisionRole == "" {
		return errors.New("division role is required")
	}

	// Validate role
	validRoles := map[string]bool{"OWNER": true, "ADMIN": true, "MEMBER": true}
	if !validRoles[req.Role] {
		return errors.New("invalid role, must be OWNER, ADMIN, or MEMBER")
	}

	// Validate division role
	validDivRoles := map[string]bool{"HEAD": true, "STAFF": true}
	if !validDivRoles[req.DivisionRole] {
		return errors.New("invalid division role, must be HEAD or STAFF")
	}

	// Basic email validation
	if !strings.Contains(req.Email, "@") {
		return errors.New("invalid email format")
	}

	return nil
}
