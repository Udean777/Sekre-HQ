package org.sekre_mobile.com.presentation.ui.glass

import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

/**
 * Shared `OutlinedTextFieldDefaults.colors` override for clean light theme.
 *
 * - Container: white fill (`surfaceFill`)
 * - Text / label / cursor: `onSurface*` tokens
 * - Indicator (border): `surfaceBorder` unfocused, `accentPrimary` focused
 * - Error indicator: `accentDanger`
 */
@Composable
fun glassTextFieldColors() = OutlinedTextFieldDefaults.colors(
    // Container
    focusedContainerColor   = SekreTheme.colors.surfaceFill,
    unfocusedContainerColor = SekreTheme.colors.surfaceFill,
    disabledContainerColor  = SekreTheme.colors.backgroundVariant,
    errorContainerColor     = SekreTheme.colors.surfaceFill,

    // Text
    focusedTextColor   = SekreTheme.colors.onSurfacePrimary,
    unfocusedTextColor = SekreTheme.colors.onSurfacePrimary,
    disabledTextColor  = SekreTheme.colors.onSurfaceTertiary,
    errorTextColor     = SekreTheme.colors.onSurfacePrimary,

    // Label
    focusedLabelColor   = SekreTheme.colors.accentPrimary,
    unfocusedLabelColor = SekreTheme.colors.onSurfaceSecondary,
    disabledLabelColor  = SekreTheme.colors.onSurfaceTertiary,
    errorLabelColor     = SekreTheme.colors.accentDanger,

    // Cursor
    cursorColor      = SekreTheme.colors.accentPrimary,
    errorCursorColor = SekreTheme.colors.accentDanger,

    // Border / indicator
    focusedBorderColor   = SekreTheme.colors.accentPrimary,
    unfocusedBorderColor = SekreTheme.colors.surfaceBorder,
    disabledBorderColor  = SekreTheme.colors.surfaceBorder.copy(alpha = 0.38f),
    errorBorderColor     = SekreTheme.colors.accentDanger,

    // Supporting text
    focusedSupportingTextColor   = SekreTheme.colors.onSurfaceSecondary,
    unfocusedSupportingTextColor = SekreTheme.colors.onSurfaceSecondary,
    errorSupportingTextColor     = SekreTheme.colors.accentDanger,

    // Trailing / leading icon
    focusedTrailingIconColor   = SekreTheme.colors.onSurfaceSecondary,
    unfocusedTrailingIconColor = SekreTheme.colors.onSurfaceTertiary,
    disabledTrailingIconColor  = SekreTheme.colors.onSurfaceTertiary,
    errorTrailingIconColor     = SekreTheme.colors.accentDanger,

    focusedLeadingIconColor    = SekreTheme.colors.onSurfaceSecondary,
    unfocusedLeadingIconColor  = SekreTheme.colors.onSurfaceTertiary,
    disabledLeadingIconColor   = SekreTheme.colors.onSurfaceTertiary,
    errorLeadingIconColor      = SekreTheme.colors.accentDanger,

    // Placeholder
    focusedPlaceholderColor   = SekreTheme.colors.onSurfaceTertiary,
    unfocusedPlaceholderColor = SekreTheme.colors.onSurfaceTertiary,
    disabledPlaceholderColor  = SekreTheme.colors.onSurfaceTertiary,
    errorPlaceholderColor     = SekreTheme.colors.onSurfaceTertiary,
)
