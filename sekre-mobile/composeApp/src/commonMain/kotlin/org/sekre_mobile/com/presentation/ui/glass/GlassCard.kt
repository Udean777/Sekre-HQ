package org.sekre_mobile.com.presentation.ui.glass

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

/**
 * GlassCard (clean modern variant)
 *
 * Outlined white card. No glass effect.
 * - Shape:   `shapes.medium` (16dp corners)
 * - Padding: `spacing.lg` (16dp)
 * - Border:  `surfaceBorder` hairline
 * - Fill:    `surfaceFill` (white)
 */
@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    intensity: GlassIntensity = GlassIntensity.Medium,
    content: @Composable BoxScope.() -> Unit,
) {
    val colors = SekreTheme.colors
    val shape  = SekreTheme.shapes.medium
    Box(
        modifier = modifier
            .clip(shape)
            .background(colors.surfaceFill)
            .border(width = 1.dp, color = colors.surfaceBorder, shape = shape),
    ) {
        Box(
            modifier = Modifier.padding(SekreTheme.spacing.lg),
            content  = content,
        )
    }
}
