package org.sekre_mobile.com.presentation.task.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
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
fun EmptyTaskState(modifier: Modifier = Modifier) {
    val colors = SekreTheme.colors

    GlassPanel(
        modifier = modifier,
        intensity = GlassIntensity.Low,
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Icon(
                imageVector = Icons.Default.CheckCircle,
                contentDescription = null,
                modifier = Modifier.size(64.dp),
                tint = colors.onGlassTertiary,
            )
            Text(
                text = "Belum Ada Tugas",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = colors.onGlassPrimary,
            )
            Text(
                text = "Semua tugas divisi akan muncul di sini. Tekan tombol + untuk membuat tugas baru.",
                style = MaterialTheme.typography.bodyMedium,
                color = colors.onGlassSecondary,
                textAlign = TextAlign.Center,
            )
        }
    }
}
