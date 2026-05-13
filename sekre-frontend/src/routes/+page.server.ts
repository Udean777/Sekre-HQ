import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// If user is authenticated, redirect to app
	if (locals.user) {
		throw redirect(303, '/app');
	}

	// If not authenticated, redirect to login
	throw redirect(303, '/login');
};
