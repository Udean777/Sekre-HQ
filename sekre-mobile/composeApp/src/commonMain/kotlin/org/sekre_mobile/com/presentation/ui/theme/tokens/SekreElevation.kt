package org.sekre_mobile.com.presentation.ui.theme.tokens

import androidx.compose.runtime.Immutable
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * SekreElevation
 *
 * Immutable elevation tokens for the Sekre design system.
 *
 * Glassmorphism uses elevation differently than Material:
 * - Glass surfaces rely on subtle shadows + border + tint, not heavy shadows.
 * - Higher levels (level4/level5) are reserved for floating modals & bottom
 *   sheets that should clearly detach from the underlying glass plane.
 *
 * Use via `SekreTheme.elevation.*`. Avoid hardcoding `dp` values for shadow
 * elevation in feature code.
 *
 * Scale:
 * - level0 -> flat (no shadow)
 * - level1 -> hairline lift (cards on backdrop)
 * - level2 -> standard card lift
 * - level3 -> hero / panel
 * - level4 -> dialogs, popovers
 * - level5 -> bottom sheets, drawers
 */
@Immutable
data class SekreElevation(
    val level0: Dp = 0.dp,
    val level1: Dp = 2.dp,
    val level2: Dp = 6.dp,
    val level3: Dp = 12.dp,
    val level4: Dp = 18.dp,
    val level5: Dp = 24.dp,
)
