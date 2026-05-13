// Package types defines strongly-typed enumerations used across the domain.
// Each type implements database/sql.Scanner and driver.Valuer so GORM
// strictly validates values on read and write.
package types

import (
	"errors"
	"fmt"
)

// ErrInvalidEnumValue is returned when a string cannot be converted to a
// known enum constant.
var ErrInvalidEnumValue = errors.New("invalid enum value")

// scanString is a shared helper that extracts a string from a database
// driver value, handling the common []byte and string cases.
func scanString(value interface{}) (string, error) {
	if value == nil {
		return "", nil
	}
	switch v := value.(type) {
	case string:
		return v, nil
	case []byte:
		return string(v), nil
	default:
		return "", fmt.Errorf("%w: unsupported type %T", ErrInvalidEnumValue, value)
	}
}
