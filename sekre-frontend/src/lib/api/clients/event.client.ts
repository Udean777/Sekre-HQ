/**
 * Event API Client
 * Following Clean Architecture - Infrastructure layer
 * Handles all HTTP communication with backend
 */

import { createApiClient } from '$lib/server/api';
import type {
	Event,
	CreateEventDTO,
	UpdateEventDTO,
	EventFilters
} from '$lib/api/types/event.types';

export class EventApiClient {
	private client;

	constructor(token?: string) {
		this.client = createApiClient(token);
	}

	/**
	 * Create a new event
	 */
	async create(data: CreateEventDTO): Promise<Event> {
		return await this.client.post<Event>('/events', data);
	}

	/**
	 * Get event by ID
	 */
	async getById(id: string): Promise<Event> {
		return await this.client.get<Event>(`/events/${id}`);
	}

	/**
	 * List events with optional filters
	 */
	async list(filters?: EventFilters): Promise<Event[]> {
		const params = new URLSearchParams();

		if (filters?.division_id) {
			params.append('division_id', filters.division_id);
		}
		if (filters?.start_date) {
			params.append('start_date', filters.start_date);
		}
		if (filters?.end_date) {
			params.append('end_date', filters.end_date);
		}

		const query = params.toString();
		const endpoint = query ? `/events?${query}` : '/events';

		return await this.client.get<Event[]>(endpoint);
	}

	/**
	 * Update event
	 */
	async update(id: string, data: UpdateEventDTO): Promise<Event> {
		return await this.client.put<Event>(`/events/${id}`, data);
	}

	/**
	 * Delete event
	 */
	async delete(id: string): Promise<void> {
		await this.client.delete<void>(`/events/${id}`);
	}
}

/**
 * Factory function to create event API client
 */
export function createEventApiClient(token?: string): EventApiClient {
	return new EventApiClient(token);
}
