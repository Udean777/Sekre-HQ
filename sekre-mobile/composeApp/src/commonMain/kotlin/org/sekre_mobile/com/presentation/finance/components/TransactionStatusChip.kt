package org.sekre_mobile.com.presentation.finance.components

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import org.sekre_mobile.com.domain.entity.TransactionStatus
import org.sekre_mobile.com.presentation.ui.glass.GlassPill
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

@Composable
fun TransactionStatusChip(status: TransactionStatus) {
    val colors = SekreTheme.colors

    val (accentColor: Color, label: String) = when (status) {
        TransactionStatus.APPROVED -> colors.accentSuccess  to "Disetujui"
        TransactionStatus.PENDING  -> colors.accentWarning  to "Menunggu"
        TransactionStatus.REJECTED -> colors.accentDanger   to "Ditolak"
    }

    GlassPill {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold,
            color = accentColor,
        )
    }
}
