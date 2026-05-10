/**
 * Formatting Utilities
 * Helper functions for formatting data
 */

/**
 * Format currency in IDR
 */
export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number): string {
	return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Format date
 */
export function formatDate(date: string | Date, format: 'short' | 'long' | 'full' = 'short'): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	
	const optionsMap: Record<'short' | 'long' | 'full', Intl.DateTimeFormatOptions> = {
		short: { year: 'numeric', month: 'short', day: 'numeric' },
		long: { year: 'numeric', month: 'long', day: 'numeric' },
		full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
	};

	return new Intl.DateTimeFormat('id-ID', optionsMap[format]).format(d);
}

/**
 * Format date and time
 */
export function formatDateTime(date: string | Date): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	
	return new Intl.DateTimeFormat('id-ID', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(d);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	const now = new Date();
	const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

	if (diffInSeconds < 60) return 'baru saja';
	if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
	if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
	if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`;
	if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} minggu yang lalu`;
	if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} bulan yang lalu`;
	return `${Math.floor(diffInSeconds / 31536000)} tahun yang lalu`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
	if (text.length <= length) return text;
	return text.slice(0, length) + '...';
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
	return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Convert to title case
 */
export function titleCase(text: string): string {
	return text
		.toLowerCase()
		.split(' ')
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
	return name
		.split(' ')
		.map(word => word.charAt(0))
		.join('')
		.toUpperCase()
		.slice(0, 2);
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 Bytes';
	
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	
	return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Generate random color from string (for avatars)
 */
export function stringToColor(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	
	const colors = [
		'#3B82F6', // blue
		'#8B5CF6', // purple
		'#EC4899', // pink
		'#F59E0B', // amber
		'#10B981', // green
		'#06B6D4', // cyan
		'#EF4444', // red
		'#6366F1'  // indigo
	];
	
	return colors[Math.abs(hash) % colors.length];
}
