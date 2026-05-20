package org.sekre_mobile.com.presentation.ui.glass

import androidx.compose.runtime.Immutable

/**
 * GlassIntensity
 *
 * Sealed interface describing the visual weight of a glass surface (OCP).
 *
 * Sekre uses a **tinted-glass** approach: there is no real backdrop blur
 * (Compose Multiplatform does not expose a cross-platform backdrop-filter API).
 * Depth and the "frosted" aesthetic are achieved via:
 * - Semi-transparent `glassTint` fill (controlled by [tintAlphaScale])
 * - Extra tint compensation ([fallbackTintAdd]) for legibility
 * - Top-edge sheen highlight
 * - Hairline glass border
 *
 * Each level controls two independent axes:
 * - [tintAlphaScale]  — multiplier on the base `glassTint` alpha. Higher = more opaque.
 * - [fallbackTintAdd] — flat alpha added on top of the scaled tint for legibility floor.
 *
 * Adding a new intensity level = add a new sealed entry. No other code changes.
 *
 * ## Choosing a level
 * - [Low]    → subtle hint of glass; use for secondary/nested surfaces.
 * - [Medium] → standard glass card; use for list items, info panels.
 * - [High]   → heavy frost; use for hero panels, modals, bottom sheets.
 * - [Custom] → escape hatch for one-off surfaces with specific requirements.
 */
@Immutable
sealed interface GlassIntensity {
    val tintAlphaScale: Float
    val fallbackTintAdd: Float

    /** Subtle glass — barely frosted, very transparent. */
    data object Low : GlassIntensity {
        override val tintAlphaScale: Float = 0.8f
        override val fallbackTintAdd: Float = 0.08f
    }

    /** Standard glass — balanced tint. Default for most surfaces. */
    data object Medium : GlassIntensity {
        override val tintAlphaScale: Float = 1.2f
        override val fallbackTintAdd: Float = 0.14f
    }

    /** Heavy frost — more opaque tint. For hero / modal surfaces. */
    data object High : GlassIntensity {
        override val tintAlphaScale: Float = 1.8f
        override val fallbackTintAdd: Float = 0.20f
    }

    /** Escape hatch for surfaces that need precise control. */
    @Immutable
    data class Custom(
        override val tintAlphaScale: Float,
        override val fallbackTintAdd: Float,
    ) : GlassIntensity
}
