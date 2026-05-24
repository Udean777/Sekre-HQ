/**
 * Format tanggal pendek: "24 Mei 2026"
 */
export const formatDateShort = (date: Date): string =>
  date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

/**
 * Format tanggal panjang: "Minggu, 24 Mei 2026"
 */
export const formatDateLong = (date: Date): string =>
  date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

/**
 * Format tanggal + waktu: "24 Mei 2026, 14.02"
 */
export const formatDateTime = (date: Date): string =>
  date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/**
 * Format waktu saja: "14.02"
 */
export const formatTime = (date: Date): string =>
  date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
