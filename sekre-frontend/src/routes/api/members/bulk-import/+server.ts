import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createApiClient } from '$lib/server/api';
import { PUBLIC_API_BASE_URL } from '$env/static/public';

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	// Check authentication
	if (!locals.user || !locals.token) {
		return json({ success: false, error: 'Not authenticated' }, { status: 401 });
	}

	try {
		// Get form data from request
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return json({ success: false, error: 'No file provided' }, { status: 400 });
		}

		// Forward to backend API
		const apiClient = createApiClient(locals.token);
		
		// Create new FormData for backend
		const backendFormData = new FormData();
		backendFormData.append('file', file);

		// Make request to backend
		const response = await fetch(`${PUBLIC_API_BASE_URL}/members/bulk-import`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${locals.token}`
			},
			body: backendFormData
		});

		if (!response.ok) {
			const error = await response.json().catch(() => ({ error: 'Upload failed' }));
			return json({ success: false, error: error.error || error.message || 'Upload failed' }, { status: response.status });
		}

		const data = await response.json();
		return json(data);
	} catch (error: any) {
		console.error('[Bulk Import] Error:', error);
		return json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
	}
};
