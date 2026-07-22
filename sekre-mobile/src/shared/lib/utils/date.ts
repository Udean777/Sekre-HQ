import i18n from "../i18n";

/**
 * Memformat string ISO date menjadi tanggal yang mudah dibaca.
 * Contoh: "2023-10-15T00:00:00Z" -> "15 Okt 2023"
 */
export function formatDate(isoString: string): string {
  if (!isoString) return "-";

  try {
    const date = new Date(isoString);
    const locale = i18n.language === "en" ? "en-US" : "id-ID";
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch (e) {
    return isoString;
  }
}
