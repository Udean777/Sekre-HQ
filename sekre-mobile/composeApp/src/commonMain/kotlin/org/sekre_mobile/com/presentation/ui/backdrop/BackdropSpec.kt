package org.sekre_mobile.com.presentation.ui.backdrop

import androidx.compose.runtime.Immutable
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color

/**
 * BackdropSpec
 *
 * Immutable data describing how a backdrop gradient canvas should be rendered.
 *
 * Separating the *spec* from the *renderer* (AuroraBackdrop) satisfies OCP:
 * - New backdrop variants = new `BackdropSpec` instance, no renderer changes.
 * - The renderer is a pure function of the spec.
 *
 * @param gradientColors  Ordered list of colors for the linear gradient (top-left → bottom-right).
 * @param orbs            Decorative radial light orbs drawn on top of the gradient.
 */
@Immutable
data class BackdropSpec(
    val gradientColors: List<Color>,
    val orbs: List<BackdropOrb> = emptyList(),
)

/**
 * BackdropOrb
 *
 * A soft radial glow drawn on the backdrop canvas to add depth and variation
 * to the gradient, making the frosted-glass blur effect more visually rich.
 *
 * @param color           Base color of the orb (alpha will be applied separately).
 * @param centerFraction  Position as a fraction of canvas size (0f..1f for both axes).
 * @param radiusFraction  Radius as a fraction of the canvas diagonal.
 * @param alpha           Opacity of the orb (0f = invisible, 1f = fully opaque).
 *                        Keep low (0.15–0.35) to avoid washing out the gradient.
 */
@Immutable
data class BackdropOrb(
    val color: Color,
    val centerFraction: Offset,
    val radiusFraction: Float,
    val alpha: Float,
)
