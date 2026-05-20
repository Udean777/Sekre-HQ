package org.sekre_mobile.com.presentation.ui.theme.material

import androidx.compose.material3.ColorScheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.darkColorScheme
import org.sekre_mobile.com.presentation.ui.theme.palette.SekrePalette

/**
 * MaterialMapping
 *
 * Bridges Sekre design tokens to Material3 primitives so that default
 * Material components (TextField, Button, Dialog, BottomSheet, etc.) pick
 * up the correct colors and shapes without any per-component overrides.
 *
 * This is the ONLY place in the codebase that knows about Material3 color
 * slot semantics. Feature screens must not reference Material3 color slots
 * directly — they use `SekreTheme.colors.*` instead.
 */
fun SekrePalette.toMaterial3ColorScheme(): ColorScheme {
    val c = colors
    return if (c.isDark) {
        darkColorScheme(
            primary            = c.accentPrimary,
            onPrimary          = c.onAccent,
            primaryContainer   = c.surfaceFill,
            onPrimaryContainer = c.onSurfacePrimary,
            secondary          = c.accentSuccess,
            onSecondary        = c.onAccent,
            tertiary           = c.accentWarning,
            onTertiary         = c.onAccent,
            background         = c.background,
            onBackground       = c.onSurfacePrimary,
            surface            = c.surfaceFill,
            onSurface          = c.onSurfacePrimary,
            surfaceVariant     = c.surfaceFillHover,
            onSurfaceVariant   = c.onSurfaceSecondary,
            error              = c.accentDanger,
            onError            = c.onAccent,
            outline            = c.surfaceBorder,
            outlineVariant     = c.surfaceBorderFocus,
        )
    } else {
        lightColorScheme(
            primary            = c.accentPrimary,
            onPrimary          = c.onAccent,
            primaryContainer   = c.surfaceFillHover,
            onPrimaryContainer = c.accentPrimary,
            secondary          = c.accentSuccess,
            onSecondary        = c.onAccent,
            secondaryContainer = c.surfaceFillHover,
            onSecondaryContainer = c.onSurfacePrimary,
            tertiary           = c.accentWarning,
            onTertiary         = c.onAccent,
            background         = c.background,
            onBackground       = c.onSurfacePrimary,
            surface            = c.surfaceFill,
            onSurface          = c.onSurfacePrimary,
            surfaceVariant     = c.surfaceFillHover,
            onSurfaceVariant   = c.onSurfaceSecondary,
            error              = c.accentDanger,
            onError            = c.onAccent,
            outline            = c.surfaceBorder,
            outlineVariant     = c.surfaceBorderFocus,
        )
    }
}

fun SekrePalette.toMaterial3Shapes(): Shapes = Shapes(
    extraSmall = shapes.extraSmall,
    small      = shapes.small,
    medium     = shapes.medium,
    large      = shapes.large,
    extraLarge = shapes.extraLarge,
)
