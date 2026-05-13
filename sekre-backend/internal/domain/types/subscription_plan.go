package types

import (
	"database/sql/driver"
	"fmt"
)

// SubscriptionPlan represents the billing tier of an organization.
type SubscriptionPlan string

const (
	SubscriptionPlanFree SubscriptionPlan = "FREE"
	SubscriptionPlanLite SubscriptionPlan = "LITE"
	SubscriptionPlanPro  SubscriptionPlan = "PRO"
)

// AllSubscriptionPlans returns every valid SubscriptionPlan value.
func AllSubscriptionPlans() []SubscriptionPlan {
	return []SubscriptionPlan{SubscriptionPlanFree, SubscriptionPlanLite, SubscriptionPlanPro}
}

// Validate reports whether p is a recognized SubscriptionPlan.
func (p SubscriptionPlan) Validate() error {
	switch p {
	case SubscriptionPlanFree, SubscriptionPlanLite, SubscriptionPlanPro:
		return nil
	default:
		return fmt.Errorf("%w: subscription plan %q", ErrInvalidEnumValue, string(p))
	}
}

// String returns the canonical string representation.
func (p SubscriptionPlan) String() string { return string(p) }

// Value implements driver.Valuer.
func (p SubscriptionPlan) Value() (driver.Value, error) {
	if err := p.Validate(); err != nil {
		return nil, err
	}
	return string(p), nil
}

// Scan implements sql.Scanner.
func (p *SubscriptionPlan) Scan(value interface{}) error {
	s, err := scanString(value)
	if err != nil {
		return err
	}
	plan := SubscriptionPlan(s)
	if err := plan.Validate(); err != nil {
		return err
	}
	*p = plan
	return nil
}
