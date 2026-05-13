package testclock

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestFakeClock_Now(t *testing.T) {
	fixedTime := time.Date(2026, 5, 13, 10, 0, 0, 0, time.UTC)
	clock := New(fixedTime)

	assert.Equal(t, fixedTime, clock.Now())
}

func TestFakeClock_Advance(t *testing.T) {
	fixedTime := time.Date(2026, 5, 13, 10, 0, 0, 0, time.UTC)
	clock := New(fixedTime)

	clock.Advance(1 * time.Hour)

	expected := time.Date(2026, 5, 13, 11, 0, 0, 0, time.UTC)
	assert.Equal(t, expected, clock.Now())
}

func TestFakeClock_Set(t *testing.T) {
	clock := New(time.Now())

	newTime := time.Date(2026, 12, 25, 0, 0, 0, 0, time.UTC)
	clock.Set(newTime)

	assert.Equal(t, newTime, clock.Now())
}
