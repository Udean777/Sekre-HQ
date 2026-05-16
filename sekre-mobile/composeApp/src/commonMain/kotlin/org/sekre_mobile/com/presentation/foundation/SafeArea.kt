package org.sekre_mobile.com.presentation.foundation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.WindowInsetsSides
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.only
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.systemBars
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

/**
 * SafeArea
 *
 * Equivalent of React Native's SafeAreaView for Compose Multiplatform.
 * Pads the content so that it does not get drawn behind the system status bar,
 * navigation bar, gesture areas, or display cutouts.
 *
 * Use this as the outermost wrapper of any screen that should respect
 * the device's safe area (status bar, notch, gesture inset, etc).
 *
 * @param modifier Optional modifier applied to the outer container.
 * @param edges Which edges of the safe area to apply padding for.
 *              Defaults to all sides (top, bottom, start, end).
 *              Pass e.g. `WindowInsetsSides.Top` to only avoid the status bar.
 * @param applyImePadding Whether to also pad for the on-screen keyboard.
 *                        Set to true on form screens (login, register, etc).
 * @param content Screen content.
 */
@Composable
fun SafeArea(
    modifier: Modifier = Modifier,
    edges: WindowInsetsSides = WindowInsetsSides.Top + WindowInsetsSides.Bottom +
            WindowInsetsSides.Start + WindowInsetsSides.End,
    applyImePadding: Boolean = false,
    content: @Composable () -> Unit,
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .consumeWindowInsets(WindowInsets.safeDrawing.only(edges))
            .windowInsetsPadding(WindowInsets.safeDrawing.only(edges))
            .let { if (applyImePadding) it.imePadding() else it }
    ) {
        content()
    }
}

/**
 * Convenience: pad only the top status bar / cutout area.
 * Useful when the screen has its own bottom bar that already handles bottom inset.
 */
@Composable
fun SafeAreaTop(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit,
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .consumeWindowInsets(WindowInsets.statusBars)
            .windowInsetsPadding(WindowInsets.statusBars)
    ) {
        content()
    }
}

/**
 * Convenience: pad both status bar and navigation bar.
 */
@Composable
fun SafeAreaSystemBars(
    modifier: Modifier = Modifier,
    applyImePadding: Boolean = false,
    content: @Composable () -> Unit,
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .consumeWindowInsets(WindowInsets.systemBars)
            .windowInsetsPadding(WindowInsets.systemBars)
            .let { if (applyImePadding) it.imePadding() else it }
    ) {
        content()
    }
}
