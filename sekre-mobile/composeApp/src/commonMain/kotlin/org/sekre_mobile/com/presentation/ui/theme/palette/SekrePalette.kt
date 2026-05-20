package org.sekre_mobile.com.presentation.ui.theme.palette

import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreColors
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreElevation
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreShapes
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreSpacing
import org.sekre_mobile.com.presentation.ui.theme.tokens.SekreTypography

/**
 * SekrePalette
 *
 * Contract for all Sekre design-system palettes (OCP).
 *
 * To add a new palette (e.g. MintCream, TwilightTeal):
 * 1. Create a new `object : SekrePalette` in the `palette/` package.
 * 2. Provide concrete token values.
 * 3. Pass the new palette to `SekreTheme(palette = ...)` in `App.kt`.
 *
 * No existing code needs to change — Open/Closed Principle is satisfied.
 *
 * Spacing, typography, and elevation have sensible defaults so palette
 * implementations only need to override them when they intentionally deviate.
 */
interface SekrePalette {
    /** Human-readable identifier, useful for debugging / analytics. */
    val name: String

    /** All color tokens for this palette. */
    val colors: SekreColors

    /** Shape tokens. Palettes may override for a distinct corner-radius feel. */
    val shapes: SekreShapes

    /** Spacing tokens. Override only when the palette targets a different density. */
    val spacing: SekreSpacing

    /** Typography tokens. Override to pair a palette with a specific type scale. */
    val typography: SekreTypography

    /** Elevation tokens. Override for palettes that use heavier or lighter shadows. */
    val elevation: SekreElevation
}
