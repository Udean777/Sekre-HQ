/**
 * Event Service
 * Following Clean Architecture - Application layer
 * Contains business logic and data transformation
 */

import type { Event, EventViewModel } from '$lib/api/types/event.types';

/**
 * Transform event to view model with computed properties
 */
export function toEventViewModel(event: Event): EventViewModel {
	const now = new Date();
	const startTime = new Date(event.start_time);
	const endTime = new Date(event.end_time);

	// Check event status
	const isUpcoming = startTime > now;
	const isOngoing = startTime <= now && endTime >= now;
	const isPast = endTime < now;

	return {
		...event,
		isUpcoming,
		isOngoing,
		isPast,
		statusColor: getStatusColor(isUpcoming, isOngoing, isPast),
		statusLabel: getStatusLabel(isUpcoming, isOngoing, isPast),
		formattedDate: formatEventDate(startTime, endTime),
		formattedTime: formatEventTime(startTime, endTime),
		duration: calculateDuration(startTime, endTime)
	};
}

/**
 * Get color for event status
 */
function getStatusColor(isUpcoming: boolean, isOngoing: boolean, isPast: boolean): string {
	if (isOngoing) return 'green';
	if (isUpcoming) return 'blue';
	if (isPast) return 'gray';
	return 'gray';
}

/**
 * Get label for event status
 */
function getStatusLabel(isUpcoming: boolean, isOngoing: boolean, isPast: boolean): string {
	if (isOngoing) return 'Ongoing';
	if (isUpcoming) return 'Upcoming';
	if (isPast) return 'Past';
	return 'Unknown';
}

/**
 * Format event date for display
 */
export function formatEventDate(startTime: Date, endTime: Date): string {
	const startDate = startTime.toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});

	const endDate = endTime.toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});

	// Same day event
	if (startDate === endDate) {
		return startDate;
	}

	// Multi-day event
	return `${startDate} - ${endDate}`;
}

/**
 * Format event time for display
 */
export function formatEventTime(startTime: Date, endTime: Date): string {
	const startTimeStr = startTime.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit'
	});

	const endTimeStr = endTime.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit'
	});

	return `${startTimeStr} - ${endTimeStr}`;
}

/**
 * Calculate event duration
 */
function calculateDuration(startTime: Date, endTime: Date): string {
	const diffMs = endTime.getTime() - startTime.getTime();
	const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
	const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

	if (diffHours === 0) {
		return `${diffMinutes} min`;
	} else if (diffMinutes === 0) {
		return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
	} else {
		return `${diffHours}h ${diffMinutes}m`;
	}
}

/**
 * Validate event form data
 */
export function validateEventForm(data: {
	title: string;
	division_id: string;
	start_time: string;
	end_time: string;
}): { valid: boolean; errors: Record<string, string> } {
	const errors: Record<string, string> = {};

	if (!data.title.trim()) {
		errors.title = 'Title is required';
	} else if (data.title.length > 500) {
		errors.title = 'Title must be less than 500 characters';
	}

	if (!data.division_id) {
		errors.division_id = 'Division is required';
	}

	if (!data.start_time) {
		errors.start_time = 'Start time is required';
	}

	if (!data.end_time) {
		errors.end_time = 'End time is required';
	}

	// Validate end time is after start time
	if (data.start_time && data.end_time) {
		const start = new Date(data.start_time);
		const end = new Date(data.end_time);

		if (end <= start) {
			errors.end_time = 'End time must be after start time';
		}
	}

	return {
		valid: Object.keys(errors).length === 0,
		errors
	};
}

/**
 * Sort events by start time (earliest first)
 */
export function sortEventsByStartTime(events: Event[]): Event[] {
	return [...events].sort((a, b) => {
		return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
	});
}

/**
 * Group events by status
 */
export function groupEventsByStatus(events: Event[]): {
	upcoming: Event[];
	ongoing: Event[];
	past: Event[];
} {
	const now = new Date();

	return {
		upcoming: events.filter((e) => new Date(e.start_time) > now),
		ongoing: events.filter(
			(e) => new Date(e.start_time) <= now && new Date(e.end_time) >= now
		),
		past: events.filter((e) => new Date(e.end_time) < now)
	};
}

/**
 * Convert local datetime-local input to ISO string
 */
export function toISOString(datetimeLocal: string): string {
	if (!datetimeLocal) return '';
	return new Date(datetimeLocal).toISOString();
}

/**
 * Convert ISO string to datetime-local input format
 */
export function toDatetimeLocal(isoString: string): string {
	if (!isoString) return '';
	const date = new Date(isoString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}
