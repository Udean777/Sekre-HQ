// Formatting utilities for display

// Format currency as Indonesian Rupiah
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount);
}

// Format date to readable format
export function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('id-ID', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}).format(date);
}

// Format date to short format
export function formatDateShort(dateString: string): string {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('id-ID', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(date);
}

// Format datetime to readable format
export function formatDateTime(dateString: string): string {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('id-ID', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(date);
}

// Format time only
export function formatTime(dateString: string): string {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('id-ID', {
		hour: '2-digit',
		minute: '2-digit'
	}).format(date);
}

// Format relative time (e.g., "2 days ago")
export function formatRelativeTime(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

	if (diffInSeconds < 60) {
		return 'just now';
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) {
		return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
	}

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
	}

	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 30) {
		return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
	}

	const diffInMonths = Math.floor(diffInDays / 30);
	if (diffInMonths < 12) {
		return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
	}

	const diffInYears = Math.floor(diffInMonths / 12);
	return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
}

// Check if date is overdue
export function isOverdue(dateString: string): boolean {
	const date = new Date(dateString);
	const now = new Date();
	return date < now;
}

// Format date for input[type="datetime-local"]
export function formatDateTimeLocal(dateString: string): string {
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const hours = String(date.getHours()).padStart(2, '0');
	const minutes = String(date.getMinutes()).padStart(2, '0');
	return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Parse datetime-local input to ISO string
export function parseDateTimeLocal(dateTimeLocal: string): string {
	return new Date(dateTimeLocal).toISOString();
}

// Truncate text with ellipsis
export function truncate(text: string, maxLength: number): string {
	if (text.length <= maxLength) {
		return text;
	}
	return text.slice(0, maxLength) + '...';
}

// Capitalize first letter
export function capitalize(text: string): string {
	return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Format subscription plan badge
export function formatPlanBadge(plan: 'FREE' | 'LITE' | 'PRO'): string {
	return plan.charAt(0) + plan.slice(1).toLowerCase();
}
