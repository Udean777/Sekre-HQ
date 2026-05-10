import { apiClient } from '$lib/core/api';
import type { RegisterRequest, LoginRequest, AuthResponse, UserWithOrganization } from './types';

export const authService = {
	async register(data: RegisterRequest): Promise<AuthResponse> {
		const response = await apiClient('/auth/register', {
			method: 'POST',
			body: JSON.stringify(data)
		});
		return response.data;
	},

	async login(data: LoginRequest): Promise<AuthResponse> {
		const response = await apiClient('/auth/login', {
			method: 'POST',
			body: JSON.stringify(data)
		});
		return response.data;
	},

	async getMe(): Promise<UserWithOrganization> {
		const response = await apiClient('/auth/me', {
			method: 'GET'
		});
		return response.data;
	},

	saveTokens(tokens: { access_token: string; refresh_token: string }) {
		localStorage.setItem('access_token', tokens.access_token);
		localStorage.setItem('refresh_token', tokens.refresh_token);
	},

	clearTokens() {
		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
	},

	getAccessToken(): string | null {
		return localStorage.getItem('access_token');
	}
};
