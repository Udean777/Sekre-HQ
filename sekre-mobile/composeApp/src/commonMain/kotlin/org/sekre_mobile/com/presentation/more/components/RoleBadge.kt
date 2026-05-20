package org.sekre_mobile.com.presentation.more.components

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import org.sekre_mobile.com.domain.entity.UserRole
import org.sekre_mobile.com.presentation.ui.glass.GlassPill
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

@Composable
fun RoleBadge(role: UserRole, modifier: Modifier = Modifier) {
    val colors = SekreTheme.colors

    val (accentColor: Color, label: String) = when (role) {
        UserRole.OWNER  -> colors.backdropAccent to "OWNER"
        UserRole.ADMIN  -> colors.accentPrimary   to "ADMIN"
        UserRole.MEMBER -> colors.onGlassTertiary to "MEMBER"
    }

    GlassPill(modifier = modifier) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = accentColor,
            fontWeight = FontWeight.Bold,
        )
    }
}
