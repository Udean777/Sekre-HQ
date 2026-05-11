import { redirect, fail, isRedirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createApiClient } from '$lib/server/api';
import { setAuthCookie } from '$lib/server/auth';
import type { AuthResponse, RegisterRequest } from '$lib/api/types';
import { getErrorMessage } from '$lib/api/errors';

export const load: PageServerLoad = async ({ locals }) => {
	// If already authenticated, redirect to app
	if (locals.user) {
		throw redirect(303, '/app');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();

		const registerData: RegisterRequest = {
			organization_name: formData.get('organization_name') as string,
			subdomain: formData.get('subdomain') as string,
			email: formData.get('email') as string,
			password: formData.get('password') as string,
			full_name: formData.get('full_name') as string
		};

		// Validate required fields
		if (
			!registerData.organization_name ||
			!registerData.subdomain ||
			!registerData.email ||
			!registerData.password ||
			!registerData.full_name
		) {
			return fail(400, {
				error: 'All fields are required',
				...registerData
			});
		}

		// Validate subdomain format
		const subdomainRegex = /^[a-z0-9-]+$/;
		if (!subdomainRegex.test(registerData.subdomain)) {
			return fail(400, {
				error: 'Subdomain can only contain lowercase letters, numbers, and hyphens',
				...registerData
			});
		}

		// Validate password length
		if (registerData.password.length < 8) {
			return fail(400, {
				error: 'Password must be at least 8 characters',
				...registerData,
				password: '' // Don't send password back
			});
		}

		try {
			// Call register API
			const api = createApiClient();
			const response = await api.post<AuthResponse>('/auth/register', registerData);

			// Set auth cookie with access_token
			setAuthCookie(cookies, response.tokens.access_token);

			// Redirect to app
			throw redirect(303, '/app');
		} catch (error) {
			// If it's a redirect, re-throw it (this is expected behavior)
			if (isRedirect(error)) {
				throw error;
			}
			
			return fail(400, {
				error: getErrorMessage(error),
				...registerData,
				password: '' // Don't send password back
			});
		}
	}
};
