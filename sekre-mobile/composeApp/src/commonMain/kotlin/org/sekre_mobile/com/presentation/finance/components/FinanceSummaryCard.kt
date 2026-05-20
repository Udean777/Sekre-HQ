package org.sekre_mobile.com.presentation.finance.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.TrendingDown
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.domain.entity.FinanceSummary
import org.sekre_mobile.com.presentation.foundation.formatCurrency
import org.sekre_mobile.com.presentation.ui.glass.GlassIntensity
import org.sekre_mobile.com.presentation.ui.glass.GlassPanel
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

@Composable
fun FinanceSummaryCard(summary: FinanceSummary?, modifier: Modifier = Modifier) {
    val colors = SekreTheme.colors
    val currency = summary?.currency ?: "IDR"

    GlassPanel(
        modifier = modifier.fillMaxWidth(),
        intensity = GlassIntensity.High,
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "Saldo Total",
                    style = MaterialTheme.typography.labelMedium,
                    color = colors.onGlassTertiary,
                )
                Text(
                    text = formatCurrency(summary?.balanceCents ?: 0L, currency),
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = colors.onGlassPrimary,
                )
            }

            HorizontalDivider(color = colors.glassBorder)

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                MetricCell(
                    modifier = Modifier.weight(1f),
                    icon = Icons.AutoMirrored.Filled.TrendingUp,
                    iconColor = colors.accentSuccess,
                    label = "Pemasukan",
                    value = formatCurrency(summary?.totalIncomeCents ?: 0L, currency),
                )
                MetricCell(
                    modifier = Modifier.weight(1f),
                    icon = Icons.AutoMirrored.Filled.TrendingDown,
                    iconColor = colors.accentDanger,
                    label = "Pengeluaran",
                    value = formatCurrency(summary?.totalExpenseCents ?: 0L, currency),
                )
            }

            summary?.transactionCount?.takeIf { it > 0 }?.let { count ->
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.AccountBalanceWallet,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = colors.onGlassTertiary,
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "$count transaksi tercatat",
                        style = MaterialTheme.typography.bodySmall,
                        color = colors.onGlassSecondary,
                    )
                }
            }
        }
    }
}

@Composable
private fun MetricCell(
    modifier: Modifier,
    icon: ImageVector,
    iconColor: Color,
    label: String,
    value: String,
) {
    val colors = SekreTheme.colors

    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(20.dp),
            tint = iconColor,
        )
        Spacer(modifier = Modifier.width(8.dp))
        Column {
            Text(
                text = label,
                style = MaterialTheme.typography.labelSmall,
                color = colors.onGlassTertiary,
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = value,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = colors.onGlassPrimary,
            )
        }
    }
}
