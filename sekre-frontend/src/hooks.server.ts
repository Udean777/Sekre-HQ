import type { Handle } from '@sveltejs/kit';
import { getSession, TOKEN_COOKIE_NAME } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	// Get token from cookies
	const token = event.cookies.get(TOKEN_COOKIE_NAME);

	// Try to get session if token exists
	if (token) {
		try {
			const session = await getSession(event.cookies);

			if (session) {
				// Set user and organization in locals
				event.locals.user = session.user;
				event.locals.organization = session.organization;
				event.locals.token = token;
			} else {
				// Token is invalid, clear the cookie
				event.cookies.delete(TOKEN_COOKIE_NAME, { path: '/' });
			}
		} catch (error) {
			// If any error occurs during session retrieval, clear the cookie
			event.cookies.delete(TOKEN_COOKIE_NAME, { path: '/' });
		}
	}

	// Continue with request
	return await resolve(event);
};
