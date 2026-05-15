/**
 * Formatting Utilities
 * Date, currency, and text formatting helpers
 */

/**
 * Format timestamp to readable date string
 */
export function formatDate(
  timestamp: number,
  format: "short" | "long" | "full" = "short",
): string {
  const date = new Date(timestamp);

  switch (format) {
    case "short":
      // MM/DD/YYYY
      return date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });

    case "long":
      // January 1, 2024
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

    case "full":
      // Monday, January 1, 2024
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });

    default:
      return date.toLocaleDateString();
  }
}

/**
 * Format timestamp to date and time string
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format timestamp to time string
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = timestamp - now;
  const absDiff = Math.abs(diff);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  const isPast = diff < 0;
  const suffix = isPast ? "ago" : "from now";

  if (absDiff < minute) {
    return "just now";
  } else if (absDiff < hour) {
    const minutes = Math.floor(absDiff / minute);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ${suffix}`;
  } else if (absDiff < day) {
    const hours = Math.floor(absDiff / hour);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ${suffix}`;
  } else if (absDiff < week) {
    const days = Math.floor(absDiff / day);
    return `${days} ${days === 1 ? "day" : "days"} ${suffix}`;
  } else if (absDiff < month) {
    const weeks = Math.floor(absDiff / week);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"} ${suffix}`;
  } else if (absDiff < year) {
    const months = Math.floor(absDiff / month);
    return `${months} ${months === 1 ? "month" : "months"} ${suffix}`;
  } else {
    const years = Math.floor(absDiff / year);
    return `${years} ${years === 1 ? "year" : "years"} ${suffix}`;
  }
}

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
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
    .split(" ")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Convert snake_case to Title Case
 */
export function snakeToTitle(text: string): string {
  return text
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Format duration (milliseconds to human readable)
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Parse ISO date string to timestamp
 */
export function parseISODate(isoString: string): number {
  return new Date(isoString).getTime();
}

/**
 * Format timestamp to ISO string
 */
export function toISOString(timestamp: number): string {
  return new Date(timestamp).toISOString();
}
