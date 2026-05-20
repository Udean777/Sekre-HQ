package org.sekre_mobile.com.presentation.ui.system

import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsControllerCompat

/**
 * Android actual for [SystemBarsController].
 *
 * `enableEdgeToEdge()` in `MainActivity` already makes the status bar and
 * navigation bar transparent and extends the app content edge-to-edge.
 * This composable fine-tunes the icon appearance to match the dark glass theme.
 *
 * - Status bar:     transparent, light icons (white) for dark backgrounds.
 * - Navigation bar: transparent, light icons for dark backgrounds.
 *
 * Uses `WindowInsetsControllerCompat` (AndroidX) which works from API 21+
 * and is the recommended approach over the deprecated `Window.statusBarColor`.
 */
@Composable
actual fun SystemBarsController(isDark: Boolean) {
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? android.app.Activity)?.window ?: return@SideEffect
            // Keep bars transparent — edge-to-edge is already enabled in MainActivity.
            window.statusBarColor     = Color.Transparent.toArgb()
            window.navigationBarColor = Color.Transparent.toArgb()

            val controller = WindowInsetsControllerCompat(window, view)
            // isAppearanceLightStatusBars = true  → dark icons (for light backgrounds)
            // isAppearanceLightStatusBars = false → light icons (for dark backgrounds)
            controller.isAppearanceLightStatusBars     = !isDark
            controller.isAppearanceLightNavigationBars = !isDark
        }
    }
}
