import { apiClient } from '$lib/core/api';
import type { Event, CreateEventRequest, UpdateEventRequest } from './types';

export const eventService = {
	async create(data: CreateEventRequest): Promise<Event> {
		const response = await apiClient('/events', {
			method: 'POST',
			body: JSON.stringify(data)
		});
		return response.data;
	},

	async list(filters?: {
		division_id?: string;
		start_date?: string;
		end_date?: string;
	}): Promise<Event[]> {
		const params = new URLSearchParams();
		if (filters?.division_id) params.append('division_id', filters.division_id);
		if (filters?.start_date) params.append('start_date', filters.start_date);
		if (filters?.end_date) params.append('end_date', filters.end_date);

		const query = params.toString();
		const response = await apiClient(`/events${query ? `?${query}` : ''}`, {
			method: 'GET'
		});
		return response.data;
	},

	async getById(id: string): Promise<Event> {
		const response = await apiClient(`/events/${id}`, {
			method: 'GET'
		});
		return response.data;
	},

	async update(id: string, data: UpdateEventRequest): Promise<Event> {
		const response = await apiClient(`/events/${id}`, {
			method: 'PUT',
			body: JSON.stringify(data)
		});
		return response.data;
	},

	async delete(id: string): Promise<void> {
		await apiClient(`/events/${id}`, {
			method: 'DELETE'
		});
	}
};
