package org.sekre_mobile.com.presentation.ui.theme.palette

import androidx.compose.ui.graphics.Color
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreColors
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreElevation
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreShapes
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreSpacing
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreTypography

/**
 * CleanLightPalette
 *
 * Clean modern light theme for Sekre Mobile.
 *
 * Design language:
 * - White/off-white background hierarchy
 * - Outlined cards with subtle border (no shadow, no glass tint)
 * - Indigo accent for primary CTA
 * - High-contrast dark text on light surfaces (WCAG AA compliant)
 *
 * Color rationale:
 * - Background: pure white (#FFFFFF) root, #F8FAFC for subtle page sections
 * - Surface: white fill (#FFFFFF), slate-50 hover (#F8FAFC)
 * - Border: slate-200 (#E2E8F0) standard, slate-400 (#94A3B8) focus
 * - Accent primary: indigo-600 (#4F46E5) — strong, professional CTA
 * - Accent success: emerald-600 (#059669)
 * - Accent danger: rose-600 (#E11D48)
 * - Accent warning: amber-600 (#D97706)
 * - Text primary: slate-900 (#0F172A) — near-black, max contrast
 * - Text secondary: slate-600 (#475569)
 * - Text tertiary: slate-400 (#94A3B8)
 * - On accent: white (#FFFFFF) — text on filled accent buttons
 */
object CleanLightPalette : SekrePalette {

    override val name: String = "Clean Light"

    override val colors: SekreColors = SekreColors(
        // Root background
        background        = Color(0xFFFFFFFF), // white
        backgroundVariant = Color(0xFFF8FAFC), // slate-50

        // Surface fills & borders
        surfaceFill       = Color(0xFFFFFFFF), // white card fill
        surfaceFillHover  = Color(0xFFF8FAFC), // slate-50 hover
        surfaceBorder     = Color(0xFFE2E8F0), // slate-200
        surfaceBorderFocus = Color(0xFF94A3B8), // slate-400

        // Accents
        accentPrimary = Color(0xFF4F46E5), // indigo-600
        accentSuccess = Color(0xFF059669), // emerald-600
        accentDanger  = Color(0xFFE11D48), // rose-600
        accentWarning = Color(0xFFD97706), // amber-600

        // Foreground on surface
        onSurfacePrimary   = Color(0xFF0F172A), // slate-900
        onSurfaceSecondary = Color(0xFF475569), // slate-600
        onSurfaceTertiary  = Color(0xFF94A3B8), // slate-400

        // Foreground on accent
        onAccent = Color(0xFFFFFFFF), // white

        isDark = false,
    )

    override val shapes: SekreShapes = SekreShapes()

    override val spacing: SekreSpacing = SekreSpacing()

    override val typography: SekreTypography = SekreTypography()

    override val elevation: SekreElevation = SekreElevation()
}
