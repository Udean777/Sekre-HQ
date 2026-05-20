package org.sekre_mobile.com.presentation.task.components

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import org.sekre_mobile.com.domain.entity.TaskStatus
import org.sekre_mobile.com.presentation.ui.glass.GlassPill
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

@Composable
fun TaskStatusChip(status: TaskStatus) {
    val colors = SekreTheme.colors

    val (accentColor: Color, label: String) = when (status) {
        TaskStatus.DONE        -> colors.accentSuccess   to "Selesai"
        TaskStatus.IN_PROGRESS -> colors.accentPrimary   to "Proses"
        else                   -> colors.onGlassTertiary to "Menunggu"
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
