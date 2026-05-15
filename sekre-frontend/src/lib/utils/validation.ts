/**
 * Validation Utilities
 * Reusable validation rules and helpers
 */

export interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

/**
 * Validate field against multiple rules
 * Returns first error message or null if valid
 */
export function validateField<T>(
  value: T,
  rules: ValidationRule<T>[],
): string | null {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return rule.message;
    }
  }
  return null;
}

/**
 * Validate multiple fields
 * Returns object with field names as keys and error messages as values
 */
export function validateFields<T extends Record<string, any>>(
  values: T,
  rules: Partial<Record<keyof T, ValidationRule<any>[]>>,
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};

  for (const field in rules) {
    const fieldRules = rules[field];
    if (fieldRules) {
      const error = validateField(values[field], fieldRules);
      if (error) {
        errors[field] = error;
      }
    }
  }

  return errors;
}

// ============================================================================
// Pre-built validation rules
// ============================================================================

/**
 * Required field validation
 */
export const required: ValidationRule<string> = {
  validate: (value) => value.trim().length > 0,
  message: "This field is required",
};

/**
 * Minimum length validation
 */
export function minLength(min: number): ValidationRule<string> {
  return {
    validate: (value) => value.length >= min,
    message: `Must be at least ${min} characters`,
  };
}

/**
 * Maximum length validation
 */
export function maxLength(max: number): ValidationRule<string> {
  return {
    validate: (value) => value.length <= max,
    message: `Must be at most ${max} characters`,
  };
}

/**
 * Email validation
 */
export const email: ValidationRule<string> = {
  validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  message: "Invalid email address",
};

/**
 * URL validation
 */
export const url: ValidationRule<string> = {
  validate: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  message: "Invalid URL",
};

/**
 * Numeric validation
 */
export const numeric: ValidationRule<string> = {
  validate: (value) => /^\d+$/.test(value),
  message: "Must be a number",
};

/**
 * Minimum value validation (for numbers)
 */
export function minValue(min: number): ValidationRule<number | string> {
  return {
    validate: (value) => {
      const num = typeof value === "string" ? parseFloat(value) : value;
      return !isNaN(num) && num >= min;
    },
    message: `Must be at least ${min}`,
  };
}

/**
 * Maximum value validation (for numbers)
 */
export function maxValue(max: number): ValidationRule<number | string> {
  return {
    validate: (value) => {
      const num = typeof value === "string" ? parseFloat(value) : value;
      return !isNaN(num) && num <= max;
    },
    message: `Must be at most ${max}`,
  };
}

/**
 * Pattern validation (regex)
 */
export function pattern(
  regex: RegExp,
  message: string,
): ValidationRule<string> {
  return {
    validate: (value) => regex.test(value),
    message,
  };
}

/**
 * Password strength validation
 */
export const strongPassword: ValidationRule<string> = {
  validate: (value) => {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
  },
  message:
    "Password must be at least 8 characters with uppercase, lowercase, and number",
};

/**
 * Match field validation (for password confirmation)
 */
export function matchField(
  otherValue: string,
  fieldName: string,
): ValidationRule<string> {
  return {
    validate: (value) => value === otherValue,
    message: `Must match ${fieldName}`,
  };
}

/**
 * Phone number validation (basic)
 */
export const phone: ValidationRule<string> = {
  validate: (value) =>
    /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, "").length >= 10,
  message: "Invalid phone number",
};

/**
 * Date validation (not in past)
 */
export const futureDate: ValidationRule<string> = {
  validate: (value) => {
    const date = new Date(value);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return date >= now;
  },
  message: "Date must be in the future",
};

/**
 * Date validation (not in future)
 */
export const pastDate: ValidationRule<string> = {
  validate: (value) => {
    const date = new Date(value);
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    return date <= now;
  },
  message: "Date must be in the past",
};

// ============================================================================
// Helper functions for simple validation
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate required field
 */
export function validateRequired(value: string): ValidationResult {
  const isValid = required.validate(value);
  return {
    valid: isValid,
    error: isValid ? undefined : required.message,
  };
}

/**
 * Validate email
 */
export function validateEmail(value: string): ValidationResult {
  const isValid = email.validate(value);
  return {
    valid: isValid,
    error: isValid ? undefined : email.message,
  };
}

/**
 * Validate minimum length
 */
export function validateMinLength(value: string, min: number): ValidationResult {
  const rule = minLength(min);
  const isValid = rule.validate(value);
  return {
    valid: isValid,
    error: isValid ? undefined : rule.message,
  };
}

/**
 * Validate maximum length
 */
export function validateMaxLength(value: string, max: number): ValidationResult {
  const rule = maxLength(max);
  const isValid = rule.validate(value);
  return {
    valid: isValid,
    error: isValid ? undefined : rule.message,
  };
}

/**
 * Validate pattern
 */
export function validatePattern(value: string, regex: RegExp, message: string): ValidationResult {
  const rule = pattern(regex, message);
  const isValid = rule.validate(value);
  return {
    valid: isValid,
    error: isValid ? undefined : rule.message,
  };
}

/**
 * Validate numeric
 */
export function validateNumeric(value: string): ValidationResult {
  const isValid = numeric.validate(value);
  return {
    valid: isValid,
    error: isValid ? undefined : numeric.message,
  };
}

/**
 * Validate URL
 */
export function validateUrl(value: string): ValidationResult {
  const isValid = url.validate(value);
  return {
    valid: isValid,
    error: isValid ? undefined : url.message,
  };
}

/**
 * Validate phone
 */
export function validatePhone(value: string): ValidationResult {
  const isValid = phone.validate(value);
  return {
    valid: isValid,
    error: isValid ? undefined : phone.message,
  };
}
