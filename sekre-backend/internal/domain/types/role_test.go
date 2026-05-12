package types

import (
	"database/sql/driver"
	"testing"
)

func TestRole_Validate(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		role    Role
		wantErr bool
	}{
		{
			name:    "valid owner",
			role:    RoleOwner,
			wantErr: false,
		},
		{
			name:    "valid admin",
			role:    RoleAdmin,
			wantErr: false,
		},
		{
			name:    "valid member",
			role:    RoleMember,
			wantErr: false,
		},
		{
			name:    "invalid empty",
			role:    "",
			wantErr: true,
		},
		{
			name:    "invalid unknown",
			role:    "SUPERUSER",
			wantErr: true,
		},
		{
			name:    "invalid lowercase",
			role:    "owner",
			wantErr: true,
		},
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

func TestRole_String(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		role Role
		want string
	}{
		{"owner", RoleOwner, "OWNER"},
		{"admin", RoleAdmin, "ADMIN"},
		{"member", RoleMember, "MEMBER"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if got := tt.role.String(); got != tt.want {
				t.Errorf("String() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestRole_CanManageOrganization(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		role Role
		want bool
	}{
		{"owner can manage", RoleOwner, true},
		{"admin can manage", RoleAdmin, true},
		{"member cannot manage", RoleMember, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if got := tt.role.CanManageOrganization(); got != tt.want {
				t.Errorf("CanManageOrganization() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestRole_IsOwner(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name string
		role Role
		want bool
	}{
		{"owner is owner", RoleOwner, true},
		{"admin is not owner", RoleAdmin, false},
		{"member is not owner", RoleMember, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if got := tt.role.IsOwner(); got != tt.want {
				t.Errorf("IsOwner() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestRole_Value(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		role    Role
		want    driver.Value
		wantErr bool
	}{
		{
			name:    "valid owner",
			role:    RoleOwner,
			want:    "OWNER",
			wantErr: false,
		},
		{
			name:    "valid admin",
			role:    RoleAdmin,
			want:    "ADMIN",
			wantErr: false,
		},
		{
			name:    "invalid role",
			role:    "INVALID",
			want:    nil,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			got, err := tt.role.Value()
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

func TestRole_Scan(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		value   interface{}
		want    Role
		wantErr bool
	}{
		{
			name:    "scan string owner",
			value:   "OWNER",
			want:    RoleOwner,
			wantErr: false,
		},
		{
			name:    "scan bytes admin",
			value:   []byte("ADMIN"),
			want:    RoleAdmin,
			wantErr: false,
		},
		{
			name:    "scan invalid role",
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
			var r Role
			err := r.Scan(tt.value)
			if (err != nil) != tt.wantErr {
				t.Errorf("Scan() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if r != tt.want {
				t.Errorf("Scan() = %v, want %v", r, tt.want)
			}
		})
	}
}

func TestAllRoles(t *testing.T) {
	t.Parallel()

	roles := AllRoles()
	if len(roles) != 3 {
		t.Errorf("AllRoles() returned %d roles, want 3", len(roles))
	}

	// Verify all returned roles are valid
	for _, role := range roles {
		if err := role.Validate(); err != nil {
			t.Errorf("AllRoles() returned invalid role %q: %v", role, err)
		}
	}

	// Verify expected roles are present
	expected := map[Role]bool{
		RoleOwner:  false,
		RoleAdmin:  false,
		RoleMember: false,
	}
	for _, role := range roles {
		if _, ok := expected[role]; ok {
			expected[role] = true
		}
	}
	for role, found := range expected {
		if !found {
			t.Errorf("AllRoles() missing expected role %q", role)
		}
	}
}
