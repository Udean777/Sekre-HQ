import { redirect, fail, isRedirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createApiClient } from '$lib/server/api';
import type { Division, CreateDivisionRequest } from '$lib/api/types';
import { getErrorMessage } from '$lib/api/errors';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.token) {
		throw redirect(303, '/login');
	}

	try {
		const api = createApiClient(locals.token);
		const divisions = await api.get<Division[]>('/divisions');

		return {
			divisions
		};
	} catch (error) {
		console.error('Failed to load divisions:', error);
		return {
			divisions: []
		};
	}
};

export const actions: Actions = {
	create: async ({ request, locals, cookies }) => {
		if (!locals.token) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const divisionData: CreateDivisionRequest = {
			name: formData.get('name') as string
		};

		if (!divisionData.name) {
			return fail(400, {
				error: 'Division name is required',
				...divisionData
			});
		}

		try {
			const api = createApiClient(locals.token);
			await api.post<Division>('/divisions', divisionData);

			// Redirect to refresh the page
			throw redirect(303, '/app/divisions');
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			return fail(400, {
				error: getErrorMessage(error),
				...divisionData
			});
		}
	},

	delete: async ({ request, locals }) => {
		if (!locals.token) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const divisionId = formData.get('id') as string;

		if (!divisionId) {
			return fail(400, { error: 'Division ID is required' });
		}

		try {
			const api = createApiClient(locals.token);
			await api.delete(`/divisions/${divisionId}`);

			throw redirect(303, '/app/divisions');
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			return fail(400, {
				error: getErrorMessage(error)
			});
		}
	}
};
