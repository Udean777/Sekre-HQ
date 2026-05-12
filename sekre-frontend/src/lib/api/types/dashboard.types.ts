/**
 * Dashboard Domain Types
 * Following Clean Architecture principles
 */

export interface DashboardStats {
	divisions_count: number;
	tasks_count: number;
	active_tasks_count: number;
	upcoming_events_count: number;
	total_income: number;
	total_expense: number;
	balance: number;
}

export interface RecentActivity {
	id: string;
	type: 'task' | 'event' | 'transaction';
	title: string;
	description: string;
	timestamp: string;
	icon: string;
	color: string;
}
