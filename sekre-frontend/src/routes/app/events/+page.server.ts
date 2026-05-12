import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createEventApiClient } from '$lib/api/clients/event.client';
import { createApiClient } from '$lib/server/api';
import type { Division } from '$lib/api/types';
import type { CreateEventDTO, UpdateEventDTO } from '$lib/api/types/event.types';
import { toISOString } from '$lib/services/event.service';

export const load: PageServerLoad = async ({ locals, url }) => {
	// Protect route
	if (!locals.user || !locals.token) {
		throw redirect(303, '/login');
	}

	const eventClient = createEventApiClient(locals.token);
	const apiClient = createApiClient(locals.token);

	// Get filter params
	const divisionId = url.searchParams.get('division_id') || undefined;
	const startDate = url.searchParams.get('start_date') || undefined;
	const endDate = url.searchParams.get('end_date') || undefined;

	try {
		// Fetch events with filters
		const events = await eventClient.list({
			division_id: divisionId,
			start_date: startDate,
			end_date: endDate
		});

		// Fetch divisions for filter
		const divisions = await apiClient.get<Division[]>('/divisions');

		console.log('[Events Page] Loaded events count:', events?.length || 0);
		console.log('[Events Page] Loaded divisions count:', divisions?.length || 0);

		return {
			events: events || [],
			divisions: divisions || [],
			filters: {
				division_id: divisionId,
				start_date: startDate,
				end_date: endDate
			}
		};
	} catch (error: any) {
		console.error('[Events Page] Failed to load events:', error);
		console.error('[Events Page] Error details:', error.message);

		// If token is invalid, redirect to login
		if (error.statusCode === 401) {
			throw redirect(303, '/login');
		}

		return {
			events: [],
			divisions: [],
			filters: {},
			error: 'Failed to load events. Please refresh the page.'
		};
	}
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.token) {
			console.error('[Create Event] No token found');
			return { error: 'Unauthorized' };
		}

		try {
			const formData = await request.formData();

			const data: CreateEventDTO = {
				title: formData.get('title') as string,
				description: formData.get('description') as string,
				division_id: formData.get('division_id') as string,
				start_time: toISOString(formData.get('start_time') as string),
				end_time: toISOString(formData.get('end_time') as string),
				location: formData.get('location') as string
			};

			console.log('[Create Event] Creating event:', data);

			const eventClient = createEventApiClient(locals.token);
			const result = await eventClient.create(data);

			console.log('[Create Event] Event created successfully:', result);

			return { success: true };
		} catch (error: any) {
			console.error('[Create Event] Failed to create event:', error);
			console.error('[Create Event] Error message:', error.message);
			return { error: error.message || 'Failed to create event' };
		}
	},

	update: async ({ request, locals }) => {
		if (!locals.token) {
			return { error: 'Unauthorized' };
		}

		try {
			const formData = await request.formData();
			const eventId = formData.get('event_id') as string;

			const data: UpdateEventDTO = {
				title: formData.get('title') as string,
				description: formData.get('description') as string,
				start_time: toISOString(formData.get('start_time') as string),
				end_time: toISOString(formData.get('end_time') as string),
				location: formData.get('location') as string
			};

			const eventClient = createEventApiClient(locals.token);
			await eventClient.update(eventId, data);

			return { success: true };
		} catch (error: any) {
			console.error('[Update Event] Failed to update event:', error);
			console.error('[Update Event] Error message:', error.message);
			return { error: error.message || 'Failed to update event' };
		}
	},

	delete: async ({ request, locals }) => {
		if (!locals.token) {
			return { error: 'Unauthorized' };
		}

		try {
			const formData = await request.formData();
			const eventId = formData.get('event_id') as string;

			const eventClient = createEventApiClient(locals.token);
			await eventClient.delete(eventId);

			return { success: true };
		} catch (error: any) {
			console.error('[Delete Event] Failed to delete event:', error);
			console.error('[Delete Event] Error message:', error.message);
			return { error: error.message || 'Failed to delete event' };
		}
	}
};
