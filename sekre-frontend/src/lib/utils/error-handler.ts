/**
 * Error Handler Utilities
 * Convert errors to user-friendly messages
 */

export type ErrorSeverity = "info" | "warning" | "error" | "critical";

/**
 * Convert any error to user-friendly message
 */
export function handleApiError(error: unknown): string {
  // Network errors
  if (isNetworkError(error)) {
    return "Connection lost. Please check your internet connection.";
  }

  // API errors with status codes
  if (error && typeof error === "object" && "statusCode" in error) {
    const statusCode = (error as any).statusCode;
    return getStatusMessage(statusCode);
  }

  // Error objects
  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message.includes("fetch")) {
      return "Network error. Please try again.";
    }
    if (error.message.includes("timeout")) {
      return "Request timed out. Please try again.";
    }
    return error.message;
  }

  // String errors
  if (typeof error === "string") {
    return error;
  }

  // Unknown errors
  return "An unexpected error occurred. Please try again.";
}

/**
 * Check if error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true;
  }

  if (error && typeof error === "object") {
    const err = error as any;
    if (err.name === "NetworkError" || err.code === "NETWORK_ERROR") {
      return true;
    }
  }

  return false;
}

/**
 * Check if error should be retried
 */
export function shouldRetry(error: unknown): boolean {
  // Retry network errors
  if (isNetworkError(error)) {
    return true;
  }

  // Retry timeout errors
  if (error instanceof Error && error.message.includes("timeout")) {
    return true;
  }

  // Retry 5xx server errors
  if (error && typeof error === "object" && "statusCode" in error) {
    const statusCode = (error as any).statusCode;
    return statusCode >= 500 && statusCode < 600;
  }

  // Retry 429 (rate limit)
  if (error && typeof error === "object" && "statusCode" in error) {
    const statusCode = (error as any).statusCode;
    return statusCode === 429;
  }

  return false;
}

/**
 * Get error severity level
 */
export function getErrorSeverity(error: unknown): ErrorSeverity {
  // Network errors are warnings (temporary)
  if (isNetworkError(error)) {
    return "warning";
  }

  // Check status code
  if (error && typeof error === "object" && "statusCode" in error) {
    const statusCode = (error as any).statusCode;

    if (statusCode >= 500) return "critical"; // Server errors
    if (statusCode === 401 || statusCode === 403) return "error"; // Auth errors
    if (statusCode === 404) return "info"; // Not found
    if (statusCode >= 400) return "warning"; // Client errors
  }

  // Default to error
  return "error";
}

/**
 * Get user-friendly message for HTTP status code
 */
function getStatusMessage(statusCode: number): string {
  const messages: Record<number, string> = {
    400: "Invalid request. Please check your input.",
    401: "Session expired. Please login again.",
    403: "Access denied. You don't have permission.",
    404: "Resource not found.",
    409: "Conflict. This resource already exists.",
    422: "Validation failed. Please check your input.",
    429: "Too many requests. Please wait a moment.",
    500: "Server error. Please try again later.",
    502: "Bad gateway. Please try again.",
    503: "Service unavailable. Please try again later.",
    504: "Gateway timeout. Please try again.",
  };

  return messages[statusCode] || `Error ${statusCode}. Please try again.`;
}

/**
 * Format error for logging
 */
export function formatErrorForLog(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack || ""}`;
  }

  if (error && typeof error === "object") {
    return JSON.stringify(error, null, 2);
  }

  return String(error);
}
