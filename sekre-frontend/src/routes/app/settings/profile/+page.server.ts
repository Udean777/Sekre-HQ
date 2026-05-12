import { fail } from '@sveltejs/kit';
import { ServerApiClient } from '$lib/server/api';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const full_name = formData.get('full_name') as string;
		const email = formData.get('email') as string;

		try {
			const api = new ServerApiClient(locals.token);
			await api.patch('/users/me/profile', { full_name, email });

			return { success: true, message: 'Profile updated successfully. Please check your email to verify your new address.' };
		} catch (error: any) {
			return fail(400, { error: error.message || 'Failed to update profile' });
		}
	}
};
