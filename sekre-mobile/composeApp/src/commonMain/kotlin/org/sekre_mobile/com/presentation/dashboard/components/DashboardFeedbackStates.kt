package org.sekre_mobile.com.presentation.dashboard.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import org.sekre_mobile.com.presentation.ui.glass.GlassIntensity
import org.sekre_mobile.com.presentation.ui.glass.GlassPanel
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

@Composable
fun DashboardLoadingState() {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        Column {}
    }
}

@Composable
fun DashboardErrorState(
    message: String,
    onRetry: () -> Unit,
) {
    val colors = SekreTheme.colors
    val spacing = SekreTheme.spacing

    Box(
        modifier = Modifier
            .fillMaxSize(),
        contentAlignment = Alignment.Center,
    ) {
        GlassPanel(
            intensity = GlassIntensity.Medium,
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(spacing.lg)
            ) {
                Text(
                    text = "Gagal memuat dashboard",
                    style = MaterialTheme.typography.titleMedium,
                    color = colors.onGlassPrimary,
                    fontWeight = FontWeight.SemiBold,
                    textAlign = TextAlign.Center,
                )

                Text(
                    text = message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.onGlassSecondary,
                    textAlign = TextAlign.Center,
                )

                Button(
                    onClick = onRetry,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colors.accentPrimary,
                        contentColor   = colors.backdropDeep,
                    )
                ) {
                    Text("Coba Lagi")
                }
            }
        }
    }
}

@Composable
fun DashboardInlineError(
    message: String,
    onRetry: () -> Unit,
) {
    val colors = SekreTheme.colors
    val spacing = SekreTheme.spacing

    GlassPanel(
        modifier = Modifier.fillMaxWidth(),
        intensity = GlassIntensity.Low,
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(spacing.xs)
            ) {
                Text(
                    text = "Masalah koneksi",
                    style = MaterialTheme.typography.titleSmall,
                    color = colors.accentDanger,
                    fontWeight = FontWeight.Bold,
                )

                Text(
                    text = message,
                    style = MaterialTheme.typography.bodySmall,
                    color = colors.onGlassSecondary,
                )
            }

            TextButton(onClick = onRetry) {
                Text(
                    text = "Refresh",
                    color = colors.accentPrimary,
                )
            }
        }
    }
}
