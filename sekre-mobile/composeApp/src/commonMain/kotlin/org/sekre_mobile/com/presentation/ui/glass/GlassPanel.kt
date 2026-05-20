package org.sekre_mobile.com.presentation.ui.glass

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

/**
 * GlassPanel (clean modern variant)
 *
 * Outlined white panel for hero sections and large content containers.
 * - Shape:   `shapes.large` (24dp corners)
 * - Padding: `spacing.xl` (24dp)
 * - Border:  `surfaceBorder` hairline
 * - Fill:    `surfaceFill` (white)
 */
@Composable
fun GlassPanel(
    modifier: Modifier = Modifier,
    intensity: GlassIntensity = GlassIntensity.Medium,
    shape: Shape = SekreTheme.shapes.large,
    content: @Composable BoxScope.() -> Unit,
) {
    val colors = SekreTheme.colors
    Box(
        modifier = modifier
            .clip(shape)
            .background(colors.surfaceFill)
            .border(width = 1.dp, color = colors.surfaceBorder, shape = shape),
    ) {
        Box(
            modifier = Modifier.padding(SekreTheme.spacing.xl),
            content  = content,
        )
    }
}
