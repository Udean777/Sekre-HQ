package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/username/sekre-backend/internal/domain"
)

type EventRepository struct {
	db *sql.DB
}

func NewEventRepository(db *sql.DB) *EventRepository {
	return &EventRepository{db: db}
}

func (r *EventRepository) Create(ctx context.Context, event *domain.Event) error {
	query := `
		INSERT INTO events (id, organization_id, division_id, title, description, start_time, end_time, location)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`
	_, err := r.db.ExecContext(ctx, query,
		event.ID, event.OrganizationID, event.DivisionID, event.Title,
		event.Description, event.StartTime, event.EndTime, event.Location,
	)
	return err
}

func (r *EventRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Event, error) {
	query := `
		SELECT id, organization_id, division_id, title, description, start_time, end_time, location, created_at, updated_at
		FROM events WHERE id = $1
	`
	event := &domain.Event{}
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&event.ID, &event.OrganizationID, &event.DivisionID, &event.Title,
		&event.Description, &event.StartTime, &event.EndTime, &event.Location,
		&event.CreatedAt, &event.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, domain.ErrEventNotFound
	}
	return event, err
}

func (r *EventRepository) List(ctx context.Context, orgID uuid.UUID, filters map[string]interface{}) ([]*domain.Event, error) {
	query := `
		SELECT id, organization_id, division_id, title, description, start_time, end_time, location, created_at, updated_at
		FROM events WHERE organization_id = $1
	`
	args := []interface{}{orgID}
	argPos := 2

	if divID, ok := filters["division_id"].(uuid.UUID); ok {
		query += fmt.Sprintf(" AND division_id = $%d", argPos)
		args = append(args, divID)
		argPos++
	}

	if startDate, ok := filters["start_date"].(string); ok {
		query += fmt.Sprintf(" AND start_time >= $%d", argPos)
		args = append(args, startDate)
		argPos++
	}

	if endDate, ok := filters["end_date"].(string); ok {
		query += fmt.Sprintf(" AND end_time <= $%d", argPos)
		args = append(args, endDate)
		argPos++
	}

	query += " ORDER BY start_time ASC"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	events := []*domain.Event{}
	for rows.Next() {
		event := &domain.Event{}
		err := rows.Scan(
			&event.ID, &event.OrganizationID, &event.DivisionID, &event.Title,
			&event.Description, &event.StartTime, &event.EndTime, &event.Location,
			&event.CreatedAt, &event.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		events = append(events, event)
	}
	return events, nil
}

func (r *EventRepository) Update(ctx context.Context, event *domain.Event) error {
	query := `
		UPDATE events 
		SET title = $1, description = $2, start_time = $3, end_time = $4, location = $5, updated_at = NOW()
		WHERE id = $6
	`
	result, err := r.db.ExecContext(ctx, query,
		event.Title, event.Description, event.StartTime, event.EndTime, event.Location, event.ID,
	)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return domain.ErrEventNotFound
	}
	return nil
}

func (r *EventRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM events WHERE id = $1`
	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return domain.ErrEventNotFound
	}
	return nil
}
