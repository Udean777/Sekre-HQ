package org.sekre_mobile.com.presentation.ui.theme.tokens

import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color

/**
 * SekreColors
 *
 * Immutable color tokens for the Sekre design system.
 *
 * This data class is the **single source of truth** for color values used by
 * the design system. Feature screens MUST consume colors via `SekreTheme.colors.*`
 * and MUST NOT hardcode `Color(0xFF...)` values directly.
 *
 * Token groups:
 * - `background*`  -> root canvas and surface hierarchy.
 * - `surface*`     -> card/panel fills, borders, hover states.
 * - `accent*`      -> CTA / status accents (primary, success, danger, warning).
 * - `onSurface*`   -> foreground text/icon colors on surface backgrounds.
 * - `onAccent*`    -> foreground text/icon on accent-colored surfaces.
 *
 * Legacy aliases (kept for call-site compatibility during migration):
 * - `backdropDeep`      → background
 * - `glassTint`         → surfaceFill
 * - `glassTintHover`    → surfaceFillHover
 * - `glassBorder`       → surfaceBorder
 * - `glassBorderHi`     → surfaceBorderFocus
 * - `onGlassPrimary`    → onSurfacePrimary
 * - `onGlassSecondary`  → onSurfaceSecondary
 * - `onGlassTertiary`   → onSurfaceTertiary
 */
@Immutable
data class SekreColors(
    // Root background
    val background: Color,
    val backgroundVariant: Color,

    // Surface fills & borders (cards, panels, inputs)
    val surfaceFill: Color,
    val surfaceFillHover: Color,
    val surfaceBorder: Color,
    val surfaceBorderFocus: Color,

    // Accents
    val accentPrimary: Color,
    val accentSuccess: Color,
    val accentDanger: Color,
    val accentWarning: Color,

    // Foreground text/icon on surface
    val onSurfacePrimary: Color,
    val onSurfaceSecondary: Color,
    val onSurfaceTertiary: Color,

    // Foreground on accent-colored surfaces (e.g. filled button label)
    val onAccent: Color,

    // Indicates whether this palette is dark.
    val isDark: Boolean,
) {
    // ── Legacy aliases ────────────────────────────────────────────────────────
    // Kept so existing call sites compile without a mass rename.
    // Will be removed in a future cleanup pass.

    /** @deprecated Use [background] */
    val backdropDeep: Color get() = background
    /** @deprecated Use [backgroundVariant] */
    val backdropMid: Color get() = backgroundVariant
    /** @deprecated Use [accentPrimary] */
    val backdropAccent: Color get() = accentPrimary

    /** @deprecated Use [surfaceFill] */
    val glassTint: Color get() = surfaceFill
    /** @deprecated Use [surfaceFillHover] */
    val glassTintHover: Color get() = surfaceFillHover
    /** @deprecated Use [surfaceBorder] */
    val glassBorder: Color get() = surfaceBorder
    /** @deprecated Use [surfaceBorderFocus] */
    val glassBorderHi: Color get() = surfaceBorderFocus

    /** @deprecated Use [onSurfacePrimary] */
    val onGlassPrimary: Color get() = onSurfacePrimary
    /** @deprecated Use [onSurfaceSecondary] */
    val onGlassSecondary: Color get() = onSurfaceSecondary
    /** @deprecated Use [onSurfaceTertiary] */
    val onGlassTertiary: Color get() = onSurfaceTertiary

    /** @deprecated Use [onAccent] */
    val backdropAccentOnAccent: Color get() = onAccent
}
