import { PUBLIC_API_BASE_URL } from '$env/static/public';
import { handleApiError } from '$lib/api/errors';
import type { ApiResponse } from '$lib/api/types';

// Server-side API client with cookie-based authentication
export class ServerApiClient {
	private baseUrl: string;
	private token?: string;

	constructor(token?: string) {
		this.baseUrl = PUBLIC_API_BASE_URL;
		this.token = token;
	}

	// Generic request method
	private async request<T>(
		endpoint: string,
		options: RequestInit = {}
	): Promise<ApiResponse<T>> {
		const url = `${this.baseUrl}${endpoint}`;

		const headers: Record<string, string> = {
			'Content-Type': 'application/json'
		};

		// Add Authorization header if token exists
		if (this.token) {
			headers['Authorization'] = `Bearer ${this.token}`;
		}

		// Merge with options headers
		if (options.headers) {
			const optHeaders = new Headers(options.headers);
			optHeaders.forEach((value, key) => {
				headers[key] = value;
			});
		}

		const response = await fetch(url, {
			...options,
			headers
		});

		// Handle error responses
		if (!response.ok) {
			await handleApiError(response);
		}

		// Parse JSON response
		const data = await response.json();
		return data as ApiResponse<T>;
	}

	// GET request
	async get<T>(endpoint: string): Promise<T> {
		const response = await this.request<T>(endpoint, {
			method: 'GET'
		});
		return response.data as T;
	}

	// POST request
	async post<T>(endpoint: string, body?: unknown): Promise<T> {
		const response = await this.request<T>(endpoint, {
			method: 'POST',
			body: body ? JSON.stringify(body) : undefined
		});
		
		// Check if data exists
		if (!response.data) {
			throw new Error('API response data is missing');
		}
		
		return response.data as T;
	}

	// PUT request
	async put<T>(endpoint: string, body?: unknown): Promise<T> {
		const response = await this.request<T>(endpoint, {
			method: 'PUT',
			body: body ? JSON.stringify(body) : undefined
		});
		return response.data as T;
	}

	// PATCH request
	async patch<T>(endpoint: string, body?: unknown): Promise<T> {
		const response = await this.request<T>(endpoint, {
			method: 'PATCH',
			body: body ? JSON.stringify(body) : undefined
		});
		return response.data as T;
	}

	// DELETE request
	async delete<T>(endpoint: string): Promise<T> {
		const response = await this.request<T>(endpoint, {
			method: 'DELETE'
		});
		return response.data as T;
	}
}

// Create API client instance with token
export function createApiClient(token?: string): ServerApiClient {
	return new ServerApiClient(token);
}
