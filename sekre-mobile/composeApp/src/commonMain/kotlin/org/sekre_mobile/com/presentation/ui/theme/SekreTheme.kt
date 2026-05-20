package org.sekre_mobile.com.presentation.ui.theme

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.ui.Modifier
import org.sekre_mobile.com.presentation.ui.theme.compositionlocal.LocalSekreColors
import org.sekre_mobile.com.presentation.ui.theme.compositionlocal.LocalSekreElevation
import org.sekre_mobile.com.presentation.ui.theme.compositionlocal.LocalSekreShapes
import org.sekre_mobile.com.presentation.ui.theme.compositionlocal.LocalSekreSpacing
import org.sekre_mobile.com.presentation.ui.theme.compositionlocal.LocalSekreTypography
import org.sekre_mobile.com.presentation.ui.theme.material.toMaterial3ColorScheme
import org.sekre_mobile.com.presentation.ui.theme.material.toMaterial3Shapes
import org.sekre_mobile.com.presentation.ui.theme.palette.CleanLightPalette
import org.sekre_mobile.com.presentation.ui.theme.palette.SekrePalette
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreColors
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreElevation
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreShapes
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreSpacing
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreTypography

/**
 * SekreTheme
 *
 * The single entry point for the Sekre design system.
 *
 * ## Usage
 * ```kotlin
 * // App.kt
 * SekreTheme {
 *     RootNavHost(...)
 * }
 * ```
 *
 * ## Switching palettes
 * Pass a different [SekrePalette] implementation to change the entire visual
 * language without touching any feature screen code:
 * ```kotlin
 * SekreTheme(palette = CleanLightPalette) { ... }
 * ```
 *
 * ## Accessing tokens
 * ```kotlin
 * val color = SekreTheme.colors.accentPrimary
 * val shape = SekreTheme.shapes.medium
 * ```
 */
@Composable
fun SekreTheme(
    palette: SekrePalette = CleanLightPalette,
    content: @Composable () -> Unit,
) {
    CompositionLocalProvider(
        LocalSekreColors    provides palette.colors,
        LocalSekreShapes    provides palette.shapes,
        LocalSekreSpacing   provides palette.spacing,
        LocalSekreTypography provides palette.typography,
        LocalSekreElevation provides palette.elevation,
    ) {
        MaterialTheme(
            colorScheme = palette.toMaterial3ColorScheme(),
            shapes      = palette.toMaterial3Shapes(),
            typography  = palette.typography.toMaterial3Typography(),
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(palette.colors.background),
            ) {
                content()
            }
        }
    }
}

/**
 * Static accessors for Sekre design tokens.
 * Use these instead of `LocalSekreColors.current` etc. at call sites.
 */
object SekreTheme {
    val colors: SekreColors
        @Composable @ReadOnlyComposable
        get() = LocalSekreColors.current

    val shapes: SekreShapes
        @Composable @ReadOnlyComposable
        get() = LocalSekreShapes.current

    val spacing: SekreSpacing
        @Composable @ReadOnlyComposable
        get() = LocalSekreSpacing.current

    val typography: SekreTypography
        @Composable @ReadOnlyComposable
        get() = LocalSekreTypography.current

    val elevation: SekreElevation
        @Composable @ReadOnlyComposable
        get() = LocalSekreElevation.current
}
