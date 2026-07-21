/**
 * Memformat string ISO date menjadi tanggal yang mudah dibaca.
 * Contoh: "2023-10-15T00:00:00Z" -> "15 Okt 2023"
 */
export function formatDate(isoString: string): string {
  if (!isoString) return "-";

  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch (e) {
    return isoString;
  }
}
