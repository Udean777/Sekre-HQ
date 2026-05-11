import { createApiClient } from './api';
import type { UserWithOrganization } from '$lib/api/types';

// Cookie name for JWT token
export const TOKEN_COOKIE_NAME = 'sekre_token';

// Cookie options
export const COOKIE_OPTIONS = {
	path: '/',
	httpOnly: true,
	secure: false, // Set to true in production with HTTPS
	sameSite: 'lax' as const,
	maxAge: 60 * 60 * 24 * 7 // 7 days
};

// Verify token and get user session
export async function verifyToken(token: string): Promise<UserWithOrganization | null> {
	try {
		const api = createApiClient(token);
		const data = await api.get<UserWithOrganization>('/auth/me');
		return data;
	} catch (error) {
		console.error('Token verification failed:', error);
		return null;
	}
}

// Get session from cookies
export async function getSession(cookies: {
	get: (name: string) => string | undefined;
}): Promise<UserWithOrganization | null> {
	const token = cookies.get(TOKEN_COOKIE_NAME);

	if (!token) {
		return null;
	}

	return await verifyToken(token);
}

// Set auth cookie
export function setAuthCookie(
	cookies: {
		set: (name: string, value: string, options: typeof COOKIE_OPTIONS) => void;
	},
	token: string
): void {
	cookies.set(TOKEN_COOKIE_NAME, token, COOKIE_OPTIONS);
}

// Clear auth cookie
export function clearAuthCookie(cookies: {
	delete: (name: string, options: { path: string }) => void;
}): void {
	cookies.delete(TOKEN_COOKIE_NAME, { path: '/' });
}
