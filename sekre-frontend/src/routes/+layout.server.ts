import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// Pass user and organization to all pages
	return {
		user: locals.user,
		organization: locals.organization
	};
};
