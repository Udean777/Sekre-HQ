package org.sekre_mobile.com.domain.util

import org.sekre_mobile.com.presentation.foundation.formatCurrency

/**
 * Backwards-compatible wrapper for legacy call sites (Dashboard widgets).
 * New code should call `formatCurrency` / `formatCurrencyIdr` directly from
 * `presentation/foundation/Money.kt`.
 */
fun formatMoney(cents: Long, currency: String): String = formatCurrency(cents, currency)
