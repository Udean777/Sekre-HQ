import type { ApiError } from './types';

// Custom error class for API errors
export class ApiException extends Error {
	public statusCode: number;
	public apiError?: ApiError;

	constructor(message: string, statusCode: number, apiError?: ApiError) {
		super(message);
		this.name = 'ApiException';
		this.statusCode = statusCode;
		this.apiError = apiError;
	}
}

// Error handler for API responses
export async function handleApiError(response: Response): Promise<never> {
	let errorMessage = 'An error occurred';
	let apiError: ApiError | undefined;

	try {
		const data = await response.json();
		apiError = data as ApiError;
		errorMessage = data.error || data.message || errorMessage;
	} catch {
		// If response is not JSON, use status text
		errorMessage = response.statusText || errorMessage;
	}

	throw new ApiException(errorMessage, response.status, apiError);
}

// Check if error is ApiException
export function isApiException(error: unknown): error is ApiException {
	return error instanceof ApiException;
}

// Get user-friendly error message
export function getErrorMessage(error: unknown): string {
	if (isApiException(error)) {
		return error.message;
	}

	if (error instanceof Error) {
		return error.message;
	}

	return 'An unexpected error occurred';
}

// Map HTTP status codes to user-friendly messages
export function getStatusMessage(statusCode: number): string {
	switch (statusCode) {
		case 400:
			return 'Invalid request. Please check your input.';
		case 401:
			return 'You are not authenticated. Please login.';
		case 403:
			return 'You do not have permission to perform this action.';
		case 404:
			return 'The requested resource was not found.';
		case 409:
			return 'This resource already exists.';
		case 422:
			return 'Validation failed. Please check your input.';
		case 500:
			return 'Server error. Please try again later.';
		case 503:
			return 'Service unavailable. Please try again later.';
		default:
			return 'An error occurred. Please try again.';
	}
}
