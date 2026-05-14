package database

import (
	"context"
	"fmt"

	"gorm.io/gorm"

	"github.com/username/sekre-backend/internal/dbctl/domain/service"
)

// rlsService implements service.RLSService
type rlsService struct {
	db *gorm.DB
}

// NewRLSService creates new RLS service
func NewRLSService(db *gorm.DB) service.RLSService {
	return &rlsService{db: db}
}

func (s *rlsService) EnableRLS(ctx context.Context, tables []string) error {
	for _, table := range tables {
		sql := fmt.Sprintf("ALTER TABLE %s ENABLE ROW LEVEL SECURITY", table)
		if err := s.db.WithContext(ctx).Exec(sql).Error; err != nil {
			return fmt.Errorf("failed to enable RLS on %s: %w", table, err)
		}
	}
	return nil
}

func (s *rlsService) DisableRLS(ctx context.Context, tables []string) error {
	for _, table := range tables {
		sql := fmt.Sprintf("ALTER TABLE %s DISABLE ROW LEVEL SECURITY", table)
		if err := s.db.WithContext(ctx).Exec(sql).Error; err != nil {
			return fmt.Errorf("failed to disable RLS on %s: %w", table, err)
		}
	}
	return nil
}

func (s *rlsService) CreateRLSFunctions(ctx context.Context) error {
	functions := []string{
		`CREATE OR REPLACE FUNCTION current_organization_id()
         RETURNS UUID AS $$
         BEGIN
             RETURN NULLIF(current_setting('app.current_organization_id', TRUE), '')::UUID;
         EXCEPTION
             WHEN OTHERS THEN RETURN NULL;
         END;
         $$ LANGUAGE plpgsql STABLE;`,

		`CREATE OR REPLACE FUNCTION current_user_id()
         RETURNS UUID AS $$
         BEGIN
             RETURN NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID;
         EXCEPTION
             WHEN OTHERS THEN RETURN NULL;
         END;
         $$ LANGUAGE plpgsql STABLE;`,
	}

	for _, fn := range functions {
		if err := s.db.WithContext(ctx).Exec(fn).Error; err != nil {
			return fmt.Errorf("failed to create RLS function: %w", err)
		}
	}

	return nil
}

func (s *rlsService) CreateRLSPolicies(ctx context.Context) error {
	// Drop existing policies first
	if err := s.dropExistingPolicies(ctx); err != nil {
		return fmt.Errorf("failed to drop existing policies: %w", err)
	}

	policies := []string{
		// Organizations policies
		`CREATE POLICY organizations_select_policy ON organizations
         FOR SELECT USING (
             id IN (
                 SELECT organization_id 
                 FROM organization_members 
                 WHERE user_id = current_user_id()
             )
         )`,

		`CREATE POLICY organizations_update_policy ON organizations
         FOR UPDATE USING (
             id IN (
                 SELECT organization_id 
                 FROM organization_members 
                 WHERE user_id = current_user_id() 
                 AND role = 'OWNER'
             )
         )`,

		// Divisions policies
		`CREATE POLICY divisions_select_policy ON divisions
         FOR SELECT USING (
             organization_id IN (
                 SELECT organization_id 
                 FROM organization_members 
                 WHERE user_id = current_user_id()
             )
         )`,

		`CREATE POLICY divisions_insert_policy ON divisions
         FOR INSERT WITH CHECK (
             organization_id IN (
                 SELECT organization_id 
                 FROM organization_members 
                 WHERE user_id = current_user_id() 
                 AND role IN ('OWNER', 'ADMIN')
             )
         )`,

		// Tasks policies
		`CREATE POLICY tasks_select_policy ON tasks
         FOR SELECT USING (
             organization_id IN (
                 SELECT organization_id 
                 FROM organization_members 
                 WHERE user_id = current_user_id()
             )
         )`,

		`CREATE POLICY tasks_insert_policy ON tasks
         FOR INSERT WITH CHECK (
             organization_id IN (
                 SELECT organization_id 
                 FROM organization_members 
                 WHERE user_id = current_user_id()
             )
         )`,

		// Events policies
		`CREATE POLICY events_select_policy ON events
         FOR SELECT USING (
             organization_id IN (
                 SELECT organization_id 
                 FROM organization_members 
                 WHERE user_id = current_user_id()
             )
         )`,

		`CREATE POLICY events_insert_policy ON events
         FOR INSERT WITH CHECK (
             organization_id IN (
                 SELECT organization_id 
                 FROM organization_members 
                 WHERE user_id = current_user_id()
             )
         )`,

		// Transactions policies
		`CREATE POLICY transactions_select_policy ON transactions
         FOR SELECT USING (
             organization_id IN (
                 SELECT organization_id 
                 FROM organization_members 
                 WHERE user_id = current_user_id()
             )
         )`,

		`CREATE POLICY transactions_insert_policy ON transactions
         FOR INSERT WITH CHECK (
             organization_id IN (
                 SELECT organization_id 
                 FROM organization_members 
                 WHERE user_id = current_user_id()
             )
         )`,
	}

	for _, policy := range policies {
		if err := s.db.WithContext(ctx).Exec(policy).Error; err != nil {
			return fmt.Errorf("failed to create RLS policy: %w", err)
		}
	}

	return nil
}

func (s *rlsService) dropExistingPolicies(ctx context.Context) error {
	// Query to get all policies
	sql := `SELECT tablename, policyname 
            FROM pg_policies 
            WHERE schemaname = 'public'`

	var policies []struct {
		Tablename  string
		Policyname string
	}

	if err := s.db.WithContext(ctx).Raw(sql).Scan(&policies).Error; err != nil {
		return err
	}

	// Drop each policy
	for _, p := range policies {
		dropSQL := fmt.Sprintf("DROP POLICY IF EXISTS %s ON %s", p.Policyname, p.Tablename)
		if err := s.db.WithContext(ctx).Exec(dropSQL).Error; err != nil {
			return err
		}
	}

	return nil
}
