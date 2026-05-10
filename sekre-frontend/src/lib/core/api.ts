// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// API Client with auth token
export async function apiClient(endpoint: string, options: RequestInit = {}) {
	const token = localStorage.getItem('access_token');
	
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options.headers as Record<string, string>)
	};

	if (token) {
		headers['Authorization'] = `Bearer ${token}`;
	}

	const response = await fetch(`${API_BASE_URL}${endpoint}`, {
		...options,
		headers
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.error || 'An error occurred');
	}

	return data;
}
