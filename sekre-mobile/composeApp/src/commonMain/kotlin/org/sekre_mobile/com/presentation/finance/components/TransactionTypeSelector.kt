package org.sekre_mobile.com.presentation.finance.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.TrendingDown
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.domain.entity.TransactionType
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

@Composable
fun TransactionTypeSelector(
    selected: TransactionType,
    onSelect: (TransactionType) -> Unit,
    modifier: Modifier = Modifier,
) {
    val colors = SekreTheme.colors

    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        FilterChip(
            modifier = Modifier.weight(1f),
            selected = selected == TransactionType.INCOME,
            onClick = { onSelect(TransactionType.INCOME) },
            label = {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.Center,
                ) {
                    Icon(
                        Icons.AutoMirrored.Filled.TrendingUp,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp),
                        tint = colors.accentSuccess,
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Pemasukan",
                        style = MaterialTheme.typography.labelLarge,
                    )
                }
            },
            shape = SekreTheme.shapes.small,
            colors = FilterChipDefaults.filterChipColors(
                selectedContainerColor = colors.accentSuccess.copy(alpha = 0.14f),
            ),
        )
        FilterChip(
            modifier = Modifier.weight(1f),
            selected = selected == TransactionType.EXPENSE,
            onClick = { onSelect(TransactionType.EXPENSE) },
            label = {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.Center,
                ) {
                    Icon(
                        Icons.AutoMirrored.Filled.TrendingDown,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp),
                        tint = colors.accentDanger,
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "Pengeluaran",
                        style = MaterialTheme.typography.labelLarge,
                    )
                }
            },
            shape = SekreTheme.shapes.small,
            colors = FilterChipDefaults.filterChipColors(
                selectedContainerColor = colors.accentDanger.copy(alpha = 0.14f),
            ),
        )
    }
}
