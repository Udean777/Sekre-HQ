export const load = async ({ locals }) => {
	return {
		user: locals.user,
		organization: locals.organization
	};
};
