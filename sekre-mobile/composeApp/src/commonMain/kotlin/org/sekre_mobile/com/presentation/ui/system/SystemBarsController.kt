package org.sekre_mobile.com.presentation.ui.system

import androidx.compose.runtime.Composable

/**
 * SystemBarsController
 *
 * Controls the appearance of system bars (status bar, navigation bar) to
 * match the Sekre glass theme.
 *
 * Called once from `App.kt` via `LaunchedEffect(Unit)` after the theme is
 * applied. Platform implementations handle the actual API calls.
 *
 * @param isDark  When `true`, system bar icons/text use light colors
 *                (appropriate for dark glass backgrounds).
 *                When `false`, icons/text use dark colors (light backgrounds).
 */
@Composable
expect fun SystemBarsController(isDark: Boolean)
