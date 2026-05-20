package org.sekre_mobile.com.presentation.ui.theme.tokens

import androidx.compose.foundation.shape.CornerSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Immutable
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * SekreShapes
 *
 * Immutable shape tokens for the Sekre design system.
 *
 * Tokens are exposed as both raw [Dp] corner radii and pre-built [RoundedCornerShape] instances so
 * consumers can use whichever fits.
 *
 * Conventions:
 * - `extraSmall` (8dp) -> chips, very small badges
 * - `small` (12dp) -> small cards / inline pills
 * - `medium` (16dp) -> standard cards (e.g. list item cards)
 * - `large` (24dp) -> panels, hero containers
 * - `extraLarge` (32dp) -> top sheets, large feature surfaces
 * - `pill` (999dp)-> fully rounded pill (status chips, role badges)
 *
 * Adding a new shape value should happen here, never inline at the call site, to keep visual rhythm
 * consistent across the app.
 */
@Immutable
data class SekreShapes(
    val extraSmallRadius: Dp = 8.dp,
    val smallRadius: Dp = 12.dp,
    val mediumRadius: Dp = 16.dp,
    val largeRadius: Dp = 24.dp,
    val extraLargeRadius: Dp = 32.dp,
    val pillRadius: Dp = 999.dp,
) {
    val extraSmall: RoundedCornerShape = RoundedCornerShape(extraSmallRadius)
    val small: RoundedCornerShape = RoundedCornerShape(smallRadius)
    val medium: RoundedCornerShape = RoundedCornerShape(mediumRadius)
    val large: RoundedCornerShape = RoundedCornerShape(largeRadius)
    val extraLarge: RoundedCornerShape = RoundedCornerShape(extraLargeRadius)
    val pill: RoundedCornerShape = RoundedCornerShape(CornerSize(pillRadius))
}
