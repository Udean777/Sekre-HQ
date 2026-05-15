import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, parent }) => {
	// Protect this route - require authentication
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	// Get parent data (from root layout)
	const parentData = await parent();

	// Return user and organization from parent
	// This ensures consistency across all app pages
	return {
		user: parentData.user,
		organization: parentData.organization
	};
};
