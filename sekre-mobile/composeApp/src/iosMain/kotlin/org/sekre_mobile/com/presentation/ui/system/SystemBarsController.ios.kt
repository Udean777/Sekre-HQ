package org.sekre_mobile.com.presentation.ui.system

import androidx.compose.runtime.Composable

/**
 * iOS actual for [SystemBarsController].
 *
 * On iOS, status bar appearance is controlled at the UIViewController level
 * via `preferredStatusBarStyle`. Compose Multiplatform renders inside a single
 * `ComposeUIViewController`, so the simplest reliable approach is to set the
 * `Info.plist` key `UIStatusBarStyle` to `UIStatusBarStyleLightContent` for
 * the dark glass theme (white icons on dark background).
 *
 * For the Aurora Indigo palette (`isDark = true`) this is already the correct
 * default when `UIViewControllerBasedStatusBarAppearance = false` is set in
 * `Info.plist` (which is the standard KMP template setup).
 *
 * If runtime switching between dark/light palettes is needed in the future,
 * this can be upgraded to call `UIApplication.sharedApplication.setStatusBarStyle`
 * or use a custom `UIViewController` subclass that overrides
 * `preferredStatusBarStyle`.
 *
 * For now this is intentionally a no-op composable — the static `Info.plist`
 * configuration handles the correct appearance without runtime API calls,
 * avoiding the complexity of UIKit interop in the composition tree.
 */
@Composable
actual fun SystemBarsController(isDark: Boolean) {
    // No-op: status bar style is configured statically via Info.plist.
    // UIStatusBarStyle = UIStatusBarStyleLightContent (white icons for dark glass theme).
}
