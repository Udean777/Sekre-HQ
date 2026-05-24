/**
 * Konversi Date ke string RFC3339 (ISO 8601) untuk backend.
 *
 * @example
 * toRFC3339(new Date('2026-05-24')) // "2026-05-24T00:00:00.000Z"
 */
export const toRFC3339 = (date: Date): string => date.toISOString();
