package types

import (
	"database/sql/driver"
	"fmt"
)

// TaskStatus represents the lifecycle state of a Task.
type TaskStatus string

const (
	TaskStatusTodo       TaskStatus = "TODO"
	TaskStatusInProgress TaskStatus = "IN_PROGRESS"
	TaskStatusDone       TaskStatus = "DONE"
)

// AllTaskStatuses returns every valid TaskStatus value.
func AllTaskStatuses() []TaskStatus {
	return []TaskStatus{TaskStatusTodo, TaskStatusInProgress, TaskStatusDone}
}

// Validate reports whether s is a recognized TaskStatus.
func (s TaskStatus) Validate() error {
	switch s {
	case TaskStatusTodo, TaskStatusInProgress, TaskStatusDone:
		return nil
	default:
		return fmt.Errorf("%w: task status %q", ErrInvalidEnumValue, string(s))
	}
}

// String returns the canonical string representation.
func (s TaskStatus) String() string { return string(s) }

// IsTerminal reports whether the status is a final state (cannot transition
// to anything else).
func (s TaskStatus) IsTerminal() bool {
	return s == TaskStatusDone
}

// Value implements driver.Valuer.
func (s TaskStatus) Value() (driver.Value, error) {
	if err := s.Validate(); err != nil {
		return nil, err
	}
	return string(s), nil
}

// Scan implements sql.Scanner.
func (s *TaskStatus) Scan(value interface{}) error {
	raw, err := scanString(value)
	if err != nil {
		return err
	}
	ts := TaskStatus(raw)
	if err := ts.Validate(); err != nil {
		return err
	}
	*s = ts
	return nil
}
