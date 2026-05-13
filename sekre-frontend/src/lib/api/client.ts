/**
 * Client-side API utilities
 * For browser-based API calls (not server-side)
 */

import { PUBLIC_API_BASE_URL } from '$env/static/public';

/**
 * Get the full API URL for a given endpoint
 */
export function getApiUrl(endpoint: string): string {
	// Remove leading slash if present to avoid double slashes
	const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
	return `${PUBLIC_API_BASE_URL}/${cleanEndpoint}`;
}

/**
 * Make an authenticated API request from the browser
 */
export async function fetchApi<T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<{ success: boolean; data: T; message?: string }> {
	const url = getApiUrl(endpoint);

	// Get token from cookie
	const token = document.cookie
		.split('; ')
		.find((row) => row.startsWith('token='))
		?.split('=')[1];

	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options.headers as Record<string, string>)
	};

	// Add Authorization header if token exists
	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const response = await fetch(url, {
		...options,
		headers
	});

	if (!response.ok) {
		const error = await response.json().catch(() => ({ message: 'Request failed' }));
		throw new Error(error.error || error.message || `HTTP ${response.status}`);
	}

	return response.json();
}
