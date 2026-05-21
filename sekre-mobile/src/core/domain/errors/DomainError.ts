// Base domain error
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Fix prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// 401 — token invalid / expired
export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';

  constructor(message = 'Sesi telah berakhir. Silakan login kembali.') {
    super(message);
  }
}

// 403 — tidak punya izin
export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';

  constructor(message = 'Anda tidak memiliki izin untuk melakukan aksi ini.') {
    super(message);
  }
}

// 404 — resource tidak ditemukan
export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';

  constructor(message = 'Data tidak ditemukan.') {
    super(message);
  }
}

// 400 — validasi gagal (dengan field-level errors)
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly fields: Record<string, string>;

  constructor(
    message = 'Data tidak valid.',
    fields: Record<string, string> = {},
  ) {
    super(message);
    this.fields = fields;
  }
}

// 409 — konflik data (misal: email sudah terdaftar)
export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';

  constructor(message = 'Data sudah ada atau terjadi konflik.') {
    super(message);
  }
}

// 429 — rate limit
export class RateLimitError extends DomainError {
  readonly code = 'RATE_LIMIT';
  readonly retryAfter?: number;

  constructor(
    message = 'Terlalu banyak permintaan. Coba lagi nanti.',
    retryAfter?: number,
  ) {
    super(message);
    this.retryAfter = retryAfter;
  }
}

// Network / timeout / offline
export class NetworkError extends DomainError {
  readonly code = 'NETWORK_ERROR';

  constructor(
    message = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
  ) {
    super(message);
  }
}

// 5xx — server error
export class ServerError extends DomainError {
  readonly code = 'SERVER_ERROR';
  readonly statusCode: number;

  constructor(
    statusCode = 500,
    message = 'Terjadi kesalahan pada server. Coba lagi nanti.',
  ) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Type guard helpers
export const isDomainError = (error: unknown): error is DomainError =>
  error instanceof DomainError;

export const isUnauthorizedError = (
  error: unknown,
): error is UnauthorizedError => error instanceof UnauthorizedError;

export const isValidationError = (error: unknown): error is ValidationError =>
  error instanceof ValidationError;

export const isNetworkError = (error: unknown): error is NetworkError =>
  error instanceof NetworkError;
