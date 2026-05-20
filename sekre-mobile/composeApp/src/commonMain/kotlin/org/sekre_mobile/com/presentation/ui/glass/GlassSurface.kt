package org.sekre_mobile.com.presentation.ui.glass

import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

/**
 * SurfaceContainer (formerly GlassSurface)
 *
 * Clean modern outlined surface. No glass tint, no blur, no sheen.
 * Depth is expressed via a hairline border and white fill.
 *
 * @param modifier  Standard Compose modifier.
 * @param shape     Corner shape.
 * @param intensity Kept for API compatibility — ignored in clean light theme.
 * @param content   Content rendered inside the surface.
 */
@Composable
fun GlassSurface(
    modifier: Modifier = Modifier,
    shape: Shape = SekreTheme.shapes.large,
    intensity: GlassIntensity = GlassIntensity.Medium,
    content: @Composable BoxScope.() -> Unit,
) {
    val colors = SekreTheme.colors
    Box(
        modifier = modifier
            .clip(shape)
            .border(width = 1.dp, color = colors.surfaceBorder, shape = shape),
        content = content,
    )
}
