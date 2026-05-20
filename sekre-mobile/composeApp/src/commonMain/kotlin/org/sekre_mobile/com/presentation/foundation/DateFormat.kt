package org.sekre_mobile.com.presentation.foundation

import kotlinx.datetime.Instant
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toInstant
import kotlinx.datetime.toLocalDateTime

/**
 * Date / time formatting helpers used across feature screens.
 *
 * We avoid platform-specific `DateTimeFormatter`s so that this file can live in
 * `commonMain` and behave identically on Android & iOS.
 */

/** Format an epoch in millis to `dd/MM/yyyy`. Returns "" if formatting fails. */
fun formatDate(epochMillis: Long?): String {
    if (epochMillis == null) return ""
    return try {
        val ldt = Instant.fromEpochMilliseconds(epochMillis)
            .toLocalDateTime(TimeZone.currentSystemDefault())
        "${pad(ldt.dayOfMonth)}/${pad(ldt.monthNumber)}/${ldt.year}"
    } catch (_: Throwable) {
        ""
    }
}

/** Format an epoch in millis to `dd/MM/yyyy HH:mm`. */
fun formatDateTime(epochMillis: Long?): String {
    if (epochMillis == null) return ""
    return try {
        val ldt = Instant.fromEpochMilliseconds(epochMillis)
            .toLocalDateTime(TimeZone.currentSystemDefault())
        "${pad(ldt.dayOfMonth)}/${pad(ldt.monthNumber)}/${ldt.year} ${pad(ldt.hour)}:${pad(ldt.minute)}"
    } catch (_: Throwable) {
        ""
    }
}

/** Format `HH:mm` only. */
fun formatTime(epochMillis: Long?): String {
    if (epochMillis == null) return ""
    return try {
        val ldt = Instant.fromEpochMilliseconds(epochMillis)
            .toLocalDateTime(TimeZone.currentSystemDefault())
        "${pad(ldt.hour)}:${pad(ldt.minute)}"
    } catch (_: Throwable) {
        ""
    }
}

/**
 * Format a closed time range. If start and end fall on the same calendar day:
 *   `dd/MM/yyyy HH:mm – HH:mm`
 * Otherwise:
 *   `dd/MM HH:mm – dd/MM HH:mm`
 */
fun formatTimeRange(startMillis: Long, endMillis: Long): String {
    return try {
        val tz = TimeZone.currentSystemDefault()
        val s = Instant.fromEpochMilliseconds(startMillis).toLocalDateTime(tz)
        val e = Instant.fromEpochMilliseconds(endMillis).toLocalDateTime(tz)
        if (sameDay(s, e)) {
            "${pad(s.dayOfMonth)}/${pad(s.monthNumber)}/${s.year} " +
                "${pad(s.hour)}:${pad(s.minute)} – ${pad(e.hour)}:${pad(e.minute)}"
        } else {
            "${pad(s.dayOfMonth)}/${pad(s.monthNumber)} ${pad(s.hour)}:${pad(s.minute)} – " +
                "${pad(e.dayOfMonth)}/${pad(e.monthNumber)} ${pad(e.hour)}:${pad(e.minute)}"
        }
    } catch (_: Throwable) {
        ""
    }
}

/** Combine a calendar date (UTC midnight, as returned by Material3 DatePicker)
 *  with an hour and minute (in the system local time zone) into a Unix epoch. */
fun combineDateAndTime(dateUtcMillis: Long, hour: Int, minute: Int): Long {
    val tz = TimeZone.currentSystemDefault()
    // Material3 DatePicker hands us UTC midnight; convert to date components first
    // so the combined timestamp respects the local time zone.
    val utcDate = Instant.fromEpochMilliseconds(dateUtcMillis).toLocalDateTime(TimeZone.UTC)
    val combined = LocalDateTime(
        year = utcDate.year,
        month = utcDate.month,
        dayOfMonth = utcDate.dayOfMonth,
        hour = hour,
        minute = minute,
        second = 0,
        nanosecond = 0,
    )
    return combined.toInstant(tz).toEpochMilliseconds()
}

/** Extract `(hour, minute)` from a Unix millis in the system time zone. */
fun extractHourMinute(epochMillis: Long): Pair<Int, Int> {
    val ldt = Instant.fromEpochMilliseconds(epochMillis)
        .toLocalDateTime(TimeZone.currentSystemDefault())
    return ldt.hour to ldt.minute
}

private fun sameDay(a: LocalDateTime, b: LocalDateTime): Boolean =
    a.year == b.year && a.monthNumber == b.monthNumber && a.dayOfMonth == b.dayOfMonth

private fun pad(value: Int): String = value.toString().padStart(2, '0')
