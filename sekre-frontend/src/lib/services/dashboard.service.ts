/**
 * Dashboard Service
 * Following Clean Architecture - Application layer
 * Contains business logic for dashboard data
 */

import type { DashboardStats } from '$lib/api/types/dashboard.types';
import { formatCurrency } from './finance.service';

/**
 * Get icon for stat type
 */
export function getStatIcon(type: string): string {
	const icons: Record<string, string> = {
		divisions: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
		tasks:
			'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
		events: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
		finance:
			'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
	};
	return icons[type] || '';
}

/**
 * Get color for stat type
 */
export function getStatColor(type: string): string {
	const colors: Record<string, string> = {
		divisions: 'blue',
		tasks: 'green',
		events: 'purple',
		finance: 'yellow'
	};
	return colors[type] || 'gray';
}

/**
 * Format stat value
 */
export function formatStatValue(value: number, type: string): string {
	if (type === 'finance') {
		return formatCurrency(value);
	}
	return value.toString();
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
	const hour = new Date().getHours();

	if (hour < 12) {
		return 'Good morning';
	} else if (hour < 18) {
		return 'Good afternoon';
	} else {
		return 'Good evening';
	}
}
