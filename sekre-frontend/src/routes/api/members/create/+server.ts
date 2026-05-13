import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createApiClient } from '$lib/server/api';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Check authentication
	if (!locals.user || !locals.token) {
		return json({ success: false, error: 'Not authenticated' }, { status: 401 });
	}

	try {
		const body = await request.json();

		// Forward to backend API
		const apiClient = createApiClient(locals.token);
		const response = await apiClient.post('/members/create', body);

		return json(response);
	} catch (error: any) {
		console.error('[Create Member] Error:', error);
		return json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
	}
};
