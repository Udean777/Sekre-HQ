package org.sekre_mobile.com.domain.util

/**
 * Platform-specific build flags.
 *
 * Dipakai untuk mengubah perilaku runtime antara debug dan release
 * tanpa harus pull dependency tambahan. Implementasi:
 * - Android: `BuildConfig.DEBUG` (butuh `buildFeatures.buildConfig = true`)
 * - iOS: `kotlin.native.Platform.isDebugBinary`
 *
 * Aturan umum: jangan bocorkan stack trace, exception type, atau
 * cause chain ke user di release build—itu sinyal eksploitasi
 * (info disclosure / fingerprinting).
 */
expect object BuildFlags {
    val isDebug: Boolean
}
