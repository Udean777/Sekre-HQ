package testclock

import (
	"time"

	"github.com/username/sekre-backend/pkg/clock"
)

// FakeClock implements clock.Clock with a controllable time.
// Useful for testing time-dependent logic without flaky tests.
type FakeClock struct {
	T time.Time
}

// New creates a new FakeClock set to the given time.
func New(t time.Time) *FakeClock {
	return &FakeClock{T: t}
}

// Now returns the current fake time.
func (f *FakeClock) Now() time.Time {
	return f.T
}

// Advance moves the fake clock forward by the given duration.
func (f *FakeClock) Advance(d time.Duration) {
	f.T = f.T.Add(d)
}

// Set sets the fake clock to a specific time.
func (f *FakeClock) Set(t time.Time) {
	f.T = t
}

// Ensure FakeClock implements clock.Clock
var _ clock.Clock = (*FakeClock)(nil)
