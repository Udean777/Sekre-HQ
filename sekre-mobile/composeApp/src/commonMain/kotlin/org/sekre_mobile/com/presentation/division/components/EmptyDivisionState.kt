package org.sekre_mobile.com.presentation.division.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DomainDisabled
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.ui.glass.GlassIntensity
import org.sekre_mobile.com.presentation.ui.glass.GlassPanel
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

@Composable
fun EmptyDivisionState(modifier: Modifier = Modifier) {
    val colors = SekreTheme.colors

    GlassPanel(
        modifier = modifier,
        intensity = GlassIntensity.Low,
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Icon(
                imageVector = Icons.Default.DomainDisabled,
                contentDescription = null,
                modifier = Modifier.size(48.dp),
                tint = colors.onGlassTertiary,
            )
            Text(
                text = "Belum ada divisi",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = colors.onGlassPrimary,
            )
            Text(
                text = "Buat divisi pertama untuk mulai mengatur anggota.",
                style = MaterialTheme.typography.bodySmall,
                color = colors.onGlassSecondary,
                textAlign = TextAlign.Center,
            )
        }
    }
}
