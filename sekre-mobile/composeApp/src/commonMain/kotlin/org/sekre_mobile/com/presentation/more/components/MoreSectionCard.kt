package org.sekre_mobile.com.presentation.more.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.ui.glass.GlassSurface
import org.sekre_mobile.com.presentation.ui.glass.GlassIntensity
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

@Composable
fun MoreSectionCard(
    title: String,
    modifier: Modifier = Modifier,
    content: @Composable MoreSectionScope.() -> Unit,
) {
    val colors = SekreTheme.colors

    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = title,
            style = MaterialTheme.typography.labelLarge,
            fontWeight = FontWeight.SemiBold,
            color = colors.onGlassSecondary,
            modifier = Modifier.padding(horizontal = 4.dp, vertical = 8.dp),
        )
        GlassSurface(
            modifier = Modifier.fillMaxWidth(),
            shape = SekreTheme.shapes.medium,
            intensity = GlassIntensity.Medium,
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                val scope = MoreSectionScopeImpl()
                scope.content()
                scope.Render()
            }
        }
    }
}

interface MoreSectionScope {
    fun item(content: @Composable () -> Unit)
}

private class MoreSectionScopeImpl : MoreSectionScope {
    private val items = mutableListOf<@Composable () -> Unit>()

    override fun item(content: @Composable () -> Unit) {
        items.add(content)
    }

    @Composable
    fun Render() {
        items.forEachIndexed { index, content ->
            content()
            if (index != items.lastIndex) {
                HorizontalDivider(
                    color = SekreTheme.colors.glassBorder,
                    modifier = Modifier.padding(start = 56.dp),
                )
            }
        }
    }
}
