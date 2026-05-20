package org.sekre_mobile.com.data.mapper

import kotlinx.datetime.Instant

/**
 * Common Mapper Utilities
 * Shared functions for all mappers
 */
object MapperUtils {

    /** Parse ISO 8601 timestamp to Unix milliseconds */
    fun parseTimestamp(timestamp: String): Long {
        return try {
            Instant.parse(timestamp).toEpochMilliseconds()
        } catch (e: Exception) {
            // Fallback to epoch start if parsing fails
            0L
        }
    }

    /** Format Unix timestamp to ISO 8601 string for API */
    fun Long.toIso8601String(): String {
        return try {
            Instant.fromEpochMilliseconds(this).toString()
        } catch (e: Exception) {
            // Fallback to epoch start if conversion fails
            Instant.fromEpochMilliseconds(0L).toString()
        }
    }
}
