package org.sekre_mobile.com.presentation.dashboard.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.domain.entity.FinanceSummary
import org.sekre_mobile.com.domain.util.formatMoney


@Composable
fun DashboardMetrics(
    summary: FinanceSummary?, isWide: Boolean
) {
    if (summary == null) return

    val incomeStr = formatMoney(summary.totalIncomeCents, summary.currency)
    val expenseStr = formatMoney(summary.totalExpenseCents, summary.currency)
    val txCountStr = summary.transactionCount.toString()

    if (isWide) {
        Row(
            modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            MetricCard("Pemasukan", incomeStr, Modifier.weight(1f))
            MetricCard("Pengeluaran", expenseStr, Modifier.weight(1f))
            MetricCard("Transaksi", txCountStr, Modifier.weight(1f))
        }
    } else {
        Column(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                MetricCard("Pemasukan", incomeStr, Modifier.weight(1f))
                MetricCard("Pengeluaran", expenseStr, Modifier.weight(1f))
            }
            MetricCard("Total Transaksi", txCountStr, Modifier.fillMaxWidth())
        }
    }
}

@Composable
fun MetricCard(
    label: String, value: String, modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
    ) {
        Column(
            modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Text(
                text = value,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface,
                fontWeight = FontWeight.Bold,
            )
        }
    }
}