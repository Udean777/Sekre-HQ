import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { clearAuthCookie } from '$lib/server/auth';

export const actions: Actions = {
	default: async ({ cookies }) => {
		// Clear auth cookie
		clearAuthCookie(cookies);

		// Redirect to login
		throw redirect(303, '/login');
	}
};
