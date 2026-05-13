import { redirect, fail, isRedirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createApiClient } from '$lib/server/api';
import { setAuthCookie } from '$lib/server/auth';
import type { AuthResponse, LoginRequest } from '$lib/api/types';
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

		const loginData: LoginRequest = {
			email: formData.get('email') as string,
			password: formData.get('password') as string
		};

		// Validate required fields
		if (!loginData.email || !loginData.password) {
			return fail(400, {
				error: 'Email and password are required',
				email: loginData.email
			});
		}

		try {
			// Call login API
			const api = createApiClient();
			const response = await api.post<AuthResponse>('/auth/login', loginData);

			// Set auth cookie with access_token
			setAuthCookie(cookies, response.tokens.access_token);

			// Redirect to app
			throw redirect(303, '/app');
		} catch (error) {
			// If it's a redirect, re-throw it (this is expected behavior)
			if (isRedirect(error)) {
				throw error;
			}
			
			return fail(401, {
				error: getErrorMessage(error),
				email: loginData.email
			});
		}
	}
};
