package org.sekre_mobile.com.presentation.ui.theme.tokens

import androidx.compose.runtime.Immutable
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * SekreSpacing
 *
 * Immutable spacing tokens for the Sekre design system.
 *
 * Use these tokens for:
 * - Container padding
 * - Vertical/horizontal arrangement gaps
 * - Insets between rows
 *
 * Avoid hardcoding `dp` values inside feature screens; consume via
 * `SekreTheme.spacing.*` instead. This keeps rhythm consistent and lets us
 * tune the entire app's density by editing one file.
 *
 * Scale rationale:
 * - 4 / 8 / 12 / 16 / 24 / 32 — multiples-of-4 grid. Predictable on most
 *   screen densities and aligns with Material3 default spacings.
 */
@Immutable
data class SekreSpacing(
    val xs: Dp = 4.dp,
    val sm: Dp = 8.dp,
    val md: Dp = 12.dp,
    val lg: Dp = 16.dp,
    val xl: Dp = 24.dp,
    val xxl: Dp = 32.dp,
    val xxxl: Dp = 48.dp,
)
