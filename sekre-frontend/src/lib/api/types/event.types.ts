/**
 * Event Domain Types
 * Following Clean Architecture principles - Domain entities
 */

export interface Event {
	id: string;
	organization_id: string;
	division_id: string;
	title: string;
	description: string;
	start_time: string;
	end_time: string;
	location: string;
	created_at: string;
	updated_at: string;
}

// DTOs (Data Transfer Objects)
export interface CreateEventDTO {
	division_id: string;
	title: string;
	description: string;
	start_time: string;
	end_time: string;
	location: string;
}

export interface UpdateEventDTO {
	title: string;
	description: string;
	start_time: string;
	end_time: string;
	location: string;
}

// Query filters
export interface EventFilters {
	division_id?: string;
	start_date?: string;
	end_date?: string;
}

// View Models (for UI)
export interface EventViewModel extends Event {
	isUpcoming: boolean;
	isOngoing: boolean;
	isPast: boolean;
	statusColor: string;
	statusLabel: string;
	formattedDate: string;
	formattedTime: string;
	duration: string;
}
