import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Protect this route - require authentication
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	// Pass user and organization to all app pages
	return {
		user: locals.user,
		organization: locals.organization
	};
};
