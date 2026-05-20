package org.sekre_mobile.com.presentation.dashboard.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.domain.entity.FinanceSummary
import org.sekre_mobile.com.domain.util.formatMoney
import org.sekre_mobile.com.presentation.ui.glass.GlassCard
import org.sekre_mobile.com.presentation.ui.glass.GlassIntensity
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

@Composable
fun DashboardMetrics(
    summary: FinanceSummary?,
    isWide: Boolean
) {
    if (summary == null) return

    val incomeStr = formatMoney(summary.totalIncomeCents, summary.currency)
    val expenseStr = formatMoney(summary.totalExpenseCents, summary.currency)
    val txCountStr = summary.transactionCount.toString()

    if (isWide) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            MetricCard("Pemasukan", incomeStr, MetricTone.Success, Modifier.weight(1f))
            MetricCard("Pengeluaran", expenseStr, MetricTone.Danger, Modifier.weight(1f))
            MetricCard("Transaksi", txCountStr, MetricTone.Primary, Modifier.weight(1f))
        }
    } else {
        Column(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                MetricCard("Pemasukan", incomeStr, MetricTone.Success, Modifier.weight(1f))
                MetricCard("Pengeluaran", expenseStr, MetricTone.Danger, Modifier.weight(1f))
            }
            MetricCard("Total Transaksi", txCountStr, MetricTone.Primary, Modifier.fillMaxWidth())
        }
    }
}

@Composable
fun MetricCard(
    label: String,
    value: String,
    tone: MetricTone,
    modifier: Modifier = Modifier
) {
    val colors = SekreTheme.colors
    val accent = when (tone) {
        MetricTone.Primary -> colors.accentPrimary
        MetricTone.Success -> colors.accentSuccess
        MetricTone.Danger  -> colors.accentDanger
    }

    GlassCard(
        modifier = modifier,
        intensity = GlassIntensity.Medium,
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.labelMedium,
                color = colors.onGlassTertiary
            )

            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                color = colors.onGlassPrimary,
                fontWeight = FontWeight.Bold,
            )

            Text(
                text = "●",
                style = MaterialTheme.typography.labelSmall,
                color = accent.copy(alpha = 0.9f),
            )
        }
    }
}

enum class MetricTone {
    Primary,
    Success,
    Danger,
}
