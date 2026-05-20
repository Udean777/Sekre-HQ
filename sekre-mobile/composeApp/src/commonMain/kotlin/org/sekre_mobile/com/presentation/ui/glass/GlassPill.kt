package org.sekre_mobile.com.presentation.ui.glass

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

/**
 * GlassPill
 *
 * Opinionated glass surface for status chips, role badges, and small labels.
 *
 * Defaults:
 * - Shape:     `shapes.pill` (fully rounded, 999dp corners)
 * - Padding:   horizontal `spacing.md` (12dp), vertical `spacing.xs` (4dp)
 * - Intensity: [GlassIntensity.Low] — subtle glass for small inline elements
 *
 * Use [GlassSurface] directly when you need to override shape or intensity.
 */
@Composable
fun GlassPill(
    modifier: Modifier = Modifier,
    intensity: GlassIntensity = GlassIntensity.Low,
    content: @Composable BoxScope.() -> Unit,
) {
    GlassSurface(
        modifier = modifier,
        shape = SekreTheme.shapes.pill,
        intensity = intensity,
    ) {
        val spacing = SekreTheme.spacing
        Box(
            modifier = Modifier.padding(
                horizontal = spacing.md,
                vertical = spacing.xs,
            ),
            content = content,
        )
    }
}
