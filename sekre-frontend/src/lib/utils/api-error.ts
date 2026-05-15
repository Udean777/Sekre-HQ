/**
 * API Error Class
 * Structured error with status code and details
 */

import type { ErrorSeverity } from "./error-handler";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly severity: ErrorSeverity;

  constructor(statusCode: number, message: string, details?: any) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.severity = this.determineSeverity();

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Check if error is client error (4xx)
   */
  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if error is server error (5xx)
   */
  isServerError(): boolean {
    return this.statusCode >= 500 && this.statusCode < 600;
  }

  /**
   * Check if error is authentication error
   */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  /**
   * Check if error is validation error
   */
  isValidationError(): boolean {
    return this.statusCode === 422;
  }

  /**
   * Check if error is not found
   */
  isNotFound(): boolean {
    return this.statusCode === 404;
  }

  /**
   * Check if error is rate limit
   */
  isRateLimit(): boolean {
    return this.statusCode === 429;
  }

  /**
   * Determine error severity based on status code
   */
  private determineSeverity(): ErrorSeverity {
    if (this.statusCode >= 500) return "critical";
    if (this.isAuthError()) return "error";
    if (this.statusCode === 404) return "info";
    if (this.isClientError()) return "warning";
    return "error";
  }

  /**
   * Convert to JSON for logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      severity: this.severity,
      details: this.details,
      stack: this.stack,
    };
  }
}

/**
 * Create ApiError from HTTP response
 */
export async function createApiErrorFromResponse(
  response: Response,
): Promise<ApiError> {
  let message = response.statusText;
  let details: any;

  try {
    const data = await response.json();
    message = data.message || data.error || message;
    details = data;
  } catch {
    // Response not JSON, use status text
  }

  return new ApiError(response.status, message, details);
}
