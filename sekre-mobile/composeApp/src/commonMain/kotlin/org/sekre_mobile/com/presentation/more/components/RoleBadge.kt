package org.sekre_mobile.com.presentation.more.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.domain.entity.UserRole

@Composable
fun RoleBadge(role: UserRole, modifier: Modifier = Modifier) {
    val (containerColor, contentColor, label) = when (role) {
        UserRole.OWNER -> Triple(
            Color(0xFF6A1B9A),
            Color.White,
            "OWNER",
        )

        UserRole.ADMIN -> Triple(
            Color(0xFF1565C0),
            Color.White,
            "ADMIN",
        )

        UserRole.MEMBER -> Triple(
            MaterialTheme.colorScheme.secondaryContainer,
            MaterialTheme.colorScheme.onSecondaryContainer,
            "MEMBER",
        )
    }
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(12.dp))
            .background(containerColor)
            .padding(horizontal = 10.dp, vertical = 4.dp),
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = contentColor,
            fontWeight = FontWeight.Bold,
        )
    }
}
