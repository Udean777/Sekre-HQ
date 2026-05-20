package org.sekre_mobile.com.presentation.ui.theme.palette

import androidx.compose.ui.graphics.Color
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreColors
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreElevation
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreShapes
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreSpacing
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreTypography

/**
 * AuroraIndigoPalette
 *
 * Legacy dark palette — kept for reference / A-B testing.
 * Active palette is now [CleanLightPalette].
 */
object AuroraIndigoPalette : SekrePalette {

    override val name: String = "Aurora Indigo"

    override val colors: SekreColors = SekreColors(
        background        = Color(0xFF0F172A),
        backgroundVariant = Color(0xFF1E1B4B),

        surfaceFill       = Color(0x1FFFFFFF),
        surfaceFillHover  = Color(0x2EFFFFFF),
        surfaceBorder     = Color(0x2EFFFFFF),
        surfaceBorderFocus = Color(0x47FFFFFF),

        accentPrimary = Color(0xFFA5B4FC),
        accentSuccess = Color(0xFF34D399),
        accentDanger  = Color(0xFFFB7185),
        accentWarning = Color(0xFFFACC15),

        onSurfacePrimary   = Color(0xFFF8FAFC),
        onSurfaceSecondary = Color(0xFFCBD5E1),
        onSurfaceTertiary  = Color(0xFF94A3B8),

        onAccent = Color(0xFF0F172A),

        isDark = true,
    )

    override val shapes: SekreShapes = SekreShapes()
    override val spacing: SekreSpacing = SekreSpacing()
    override val typography: SekreTypography = SekreTypography()
    override val elevation: SekreElevation = SekreElevation()
}
