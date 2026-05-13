package types

import (
	"database/sql/driver"
	"testing"
)

// DivisionRole tests

func TestDivisionRole_Validate(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		role    DivisionRole
		wantErr bool
	}{
		{"valid head", DivisionRoleHead, false},
		{"valid staff", DivisionRoleStaff, false},
		{"invalid empty", "", true},
		{"invalid unknown", "MANAGER", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := tt.role.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestDivisionRole_IsHead(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		role DivisionRole
		want bool
	}{
		{"head is head", DivisionRoleHead, true},
		{"staff is not head", DivisionRoleStaff, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if got := tt.role.IsHead(); got != tt.want {
				t.Errorf("IsHead() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestAllDivisionRoles(t *testing.T) {
	t.Parallel()

	roles := AllDivisionRoles()
	if len(roles) != 2 {
		t.Errorf("AllDivisionRoles() returned %d roles, want 2", len(roles))
	}

	for _, role := range roles {
		if err := role.Validate(); err != nil {
			t.Errorf("AllDivisionRoles() returned invalid role %q: %v", role, err)
		}
	}
}

// InvitationStatus tests

func TestInvitationStatus_Validate(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		status  InvitationStatus
		wantErr bool
	}{
		{"valid pending", InvitationStatusPending, false},
		{"valid accepted", InvitationStatusAccepted, false},
		{"valid expired", InvitationStatusExpired, false},
		{"invalid empty", "", true},
		{"invalid unknown", "CANCELLED", true},
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

func TestInvitationStatus_Scan(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		value   interface{}
		want    InvitationStatus
		wantErr bool
	}{
		{"scan string pending", "PENDING", InvitationStatusPending, false},
		{"scan bytes accepted", []byte("ACCEPTED"), InvitationStatusAccepted, false},
		{"scan invalid", "INVALID", "", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			var status InvitationStatus
			err := status.Scan(tt.value)
			if (err != nil) != tt.wantErr {
				t.Errorf("Scan() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if status != tt.want {
				t.Errorf("Scan() = %v, want %v", status, tt.want)
			}
		})
	}
}

func TestAllInvitationStatuses(t *testing.T) {
	t.Parallel()

	statuses := AllInvitationStatuses()
	if len(statuses) != 3 {
		t.Errorf("AllInvitationStatuses() returned %d statuses, want 3", len(statuses))
	}

	for _, status := range statuses {
		if err := status.Validate(); err != nil {
			t.Errorf("AllInvitationStatuses() returned invalid status %q: %v", status, err)
		}
	}
}

// SubscriptionPlan tests

func TestSubscriptionPlan_Validate(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		plan    SubscriptionPlan
		wantErr bool
	}{
		{"valid free", SubscriptionPlanFree, false},
		{"valid lite", SubscriptionPlanLite, false},
		{"valid pro", SubscriptionPlanPro, false},
		{"invalid empty", "", true},
		{"invalid unknown", "ENTERPRISE", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			err := tt.plan.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestSubscriptionPlan_Value(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		plan    SubscriptionPlan
		want    driver.Value
		wantErr bool
	}{
		{"valid free", SubscriptionPlanFree, "FREE", false},
		{"invalid plan", "INVALID", nil, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := tt.plan.Value()
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

func TestSubscriptionPlan_Scan(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		value   interface{}
		want    SubscriptionPlan
		wantErr bool
	}{
		{"scan string free", "FREE", SubscriptionPlanFree, false},
		{"scan bytes pro", []byte("PRO"), SubscriptionPlanPro, false},
		{"scan invalid", "INVALID", "", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			var plan SubscriptionPlan
			err := plan.Scan(tt.value)
			if (err != nil) != tt.wantErr {
				t.Errorf("Scan() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if plan != tt.want {
				t.Errorf("Scan() = %v, want %v", plan, tt.want)
			}
		})
	}
}

func TestAllSubscriptionPlans(t *testing.T) {
	t.Parallel()

	plans := AllSubscriptionPlans()
	if len(plans) != 3 {
		t.Errorf("AllSubscriptionPlans() returned %d plans, want 3", len(plans))
	}

	for _, plan := range plans {
		if err := plan.Validate(); err != nil {
			t.Errorf("AllSubscriptionPlans() returned invalid plan %q: %v", plan, err)
		}
	}
}
