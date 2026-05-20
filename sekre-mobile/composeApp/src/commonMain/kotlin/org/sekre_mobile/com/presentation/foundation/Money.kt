package org.sekre_mobile.com.presentation.foundation

import kotlin.math.absoluteValue

/**
 * Money / currency formatting helpers.
 *
 * The backend stores monetary amounts in the smallest unit (`amount_cents`),
 * which for IDR means literal sen (1/100 rupiah). UI formats the displayed
 * value in the major unit with thousand separators.
 */

/** Format an amount in cents as `Rp 1.500.000` (IDR). */
fun formatCurrencyIdr(amountCents: Long): String {
    val rupiah = amountCents / 100
    val sign = if (rupiah < 0) "-" else ""
    return "Rp $sign${addThousandSeparators(rupiah.absoluteValue)}"
}

/**
 * Format with explicit currency code. Falls back to a generic `<CCY> 1.500.000`
 * shape for non-IDR codes since the backend supports a small set of ISO codes.
 */
fun formatCurrency(amountCents: Long, currency: String): String {
    val normalized = currency.uppercase()
    if (normalized == "IDR") return formatCurrencyIdr(amountCents)
    val major = amountCents / 100
    val sign = if (major < 0) "-" else ""
    return "$normalized $sign${addThousandSeparators(major.absoluteValue)}"
}

/**
 * Parse user-entered rupiah input into cents. Accepts plain digits and inputs
 * with `.` or `,` as thousand separators; returns `null` if no digits at all.
 */
fun parseRupiahInputToCents(input: String): Long? {
    val digits = input.filter { it.isDigit() }
    if (digits.isEmpty()) return null
    val rupiah = digits.toLongOrNull() ?: return null
    return rupiah * 100
}

/** Render a long with `.` as thousand separator. */
fun addThousandSeparators(value: Long): String {
    val s = value.toString()
    if (s.length <= 3) return s
    val builder = StringBuilder()
    var count = 0
    for (i in s.indices.reversed()) {
        builder.append(s[i])
        count++
        if (count == 3 && i != 0) {
            builder.append('.')
            count = 0
        }
    }
    return builder.reverse().toString()
}
