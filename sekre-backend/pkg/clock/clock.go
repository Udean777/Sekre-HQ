package clock

import "time"

// Clock provides an abstraction over time operations.
// This allows tests to control time without using time.Sleep or dealing with flaky time-dependent tests.
type Clock interface {
	Now() time.Time
}

// RealClock implements Clock using the actual system time.
type RealClock struct{}

// Now returns the current system time.
func (RealClock) Now() time.Time {
	return time.Now()
}

// NewRealClock creates a new RealClock instance.
func NewRealClock() Clock {
	return RealClock{}
}
