package types

import (
	"database/sql/driver"
	"testing"
)

func TestTaskStatus_Validate(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		status  TaskStatus
		wantErr bool
	}{
		{
			name:    "valid todo",
			status:  TaskStatusTodo,
			wantErr: false,
		},
		{
			name:    "valid in_progress",
			status:  TaskStatusInProgress,
			wantErr: false,
		},
		{
			name:    "valid done",
			status:  TaskStatusDone,
			wantErr: false,
		},
		{
			name:    "invalid empty",
			status:  "",
			wantErr: true,
		},
		{
			name:    "invalid unknown",
			status:  "CANCELLED",
			wantErr: true,
		},
		{
			name:    "invalid lowercase",
			status:  "todo",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := tt.status.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestTaskStatus_String(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name   string
		status TaskStatus
		want   string
	}{
		{"todo", TaskStatusTodo, "TODO"},
		{"in_progress", TaskStatusInProgress, "IN_PROGRESS"},
		{"done", TaskStatusDone, "DONE"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if got := tt.status.String(); got != tt.want {
				t.Errorf("String() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestTaskStatus_IsTerminal(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name   string
		status TaskStatus
		want   bool
	}{
		{"todo is not terminal", TaskStatusTodo, false},
		{"in_progress is not terminal", TaskStatusInProgress, false},
		{"done is terminal", TaskStatusDone, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if got := tt.status.IsTerminal(); got != tt.want {
				t.Errorf("IsTerminal() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestTaskStatus_Value(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		status  TaskStatus
		want    driver.Value
		wantErr bool
	}{
		{
			name:    "valid todo",
			status:  TaskStatusTodo,
			want:    "TODO",
			wantErr: false,
		},
		{
			name:    "valid done",
			status:  TaskStatusDone,
			want:    "DONE",
			wantErr: false,
		},
		{
			name:    "invalid status",
			status:  "INVALID",
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := tt.status.Value()
			if (err != nil) != tt.wantErr {
				t.Errorf("Value() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if got != tt.want {
				t.Errorf("Value() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestTaskStatus_Scan(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		value   interface{}
		want    TaskStatus
		wantErr bool
	}{
		{
			name:    "scan string todo",
			value:   "TODO",
			want:    TaskStatusTodo,
			wantErr: false,
		},
		{
			name:    "scan bytes in_progress",
			value:   []byte("IN_PROGRESS"),
			want:    TaskStatusInProgress,
			wantErr: false,
		},
		{
			name:    "scan invalid status",
			value:   "INVALID",
			want:    "",
			wantErr: true,
		},
		{
			name:    "scan nil",
			value:   nil,
			want:    "",
			wantErr: true,
		},
		{
			name:    "scan int",
			value:   123,
			want:    "",
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			var s TaskStatus
			err := s.Scan(tt.value)
			if (err != nil) != tt.wantErr {
				t.Errorf("Scan() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if s != tt.want {
				t.Errorf("Scan() = %v, want %v", s, tt.want)
			}
		})
	}
}

func TestAllTaskStatuses(t *testing.T) {
	t.Parallel()

	statuses := AllTaskStatuses()
	if len(statuses) != 3 {
		t.Errorf("AllTaskStatuses() returned %d statuses, want 3", len(statuses))
	}

	// Verify all returned statuses are valid
	for _, status := range statuses {
		if err := status.Validate(); err != nil {
			t.Errorf("AllTaskStatuses() returned invalid status %q: %v", status, err)
		}
	}

	// Verify expected statuses are present
	expected := map[TaskStatus]bool{
		TaskStatusTodo:       false,
		TaskStatusInProgress: false,
		TaskStatusDone:       false,
	}
	for _, status := range statuses {
		if _, ok := expected[status]; ok {
			expected[status] = true
		}
	}
	for status, found := range expected {
		if !found {
			t.Errorf("AllTaskStatuses() missing expected status %q", status)
		}
	}
}
