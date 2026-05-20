package org.sekre_mobile.com.presentation.ui.backdrop

import androidx.compose.ui.geometry.Offset
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreColors

/**
 * auroraBackdropSpec
 *
 * Factory that builds the [BackdropSpec] for the Aurora Indigo palette.
 *
 * Kept as a top-level function (not inside AuroraBackdrop) so it can be
 * unit-tested independently and reused by preview composables.
 *
 * Orb placement rationale:
 * - Orb 1 (indigo, top-left, 0.55 diagonal): large soft glow anchored at the
 *   top-left quadrant, reinforcing the gradient's mid-stop.
 * - Orb 2 (violet, bottom-right, 0.45 diagonal): smaller accent glow at the
 *   bottom-right, creating a sense of depth and light source variation.
 * - Orb 3 (deep, center, 0.30 diagonal): very subtle dark orb at center to
 *   add a slight vignette that draws the eye inward.
 *
 * Alpha values are intentionally low (0.20–0.30) so the orbs add richness
 * without washing out the gradient or reducing glass-blur contrast.
 */
fun auroraBackdropSpec(colors: SekreColors): BackdropSpec = BackdropSpec(
    gradientColors = listOf(
        colors.backdropDeep,
        colors.backdropMid,
        colors.backdropAccent,
    ),
    orbs = listOf(
        BackdropOrb(
            color = colors.backdropMid,
            centerFraction = Offset(0.15f, 0.20f),
            radiusFraction = 0.55f,
            alpha = 0.28f,
        ),
        BackdropOrb(
            color = colors.backdropAccent,
            centerFraction = Offset(0.85f, 0.78f),
            radiusFraction = 0.45f,
            alpha = 0.22f,
        ),
        BackdropOrb(
            color = colors.backdropDeep,
            centerFraction = Offset(0.50f, 0.50f),
            radiusFraction = 0.30f,
            alpha = 0.20f,
        ),
    ),
)
