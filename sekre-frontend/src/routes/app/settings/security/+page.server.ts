import { fail } from '@sveltejs/kit';
import { ServerApiClient } from '$lib/server/api';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const current_password = formData.get('current_password') as string;
		const new_password = formData.get('new_password') as string;
		const confirm_password = formData.get('confirm_password') as string;

		// Client-side validation
		if (new_password !== confirm_password) {
			return fail(400, { error: 'Passwords do not match' });
		}

		if (new_password.length < 8) {
			return fail(400, { error: 'Password must be at least 8 characters' });
		}

		try {
			const api = new ServerApiClient(locals.token);
			await api.post('/users/me/change-password', {
				current_password,
				new_password
			});

			return { success: true, message: 'Password changed successfully' };
		} catch (error: any) {
			return fail(400, { error: error.message || 'Failed to change password. Check your current password.' });
		}
	}
};
