package org.sekre_mobile.com.presentation.more.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.domain.entity.AuthenticatedUser
import org.sekre_mobile.com.domain.entity.Profile
import org.sekre_mobile.com.presentation.ui.glass.GlassIntensity
import org.sekre_mobile.com.presentation.ui.glass.GlassPanel
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

@Composable
fun ProfileHeaderCard(
    user: AuthenticatedUser?,
    profile: Profile?,
    modifier: Modifier = Modifier,
) {
    val colors = SekreTheme.colors
    val displayName = profile?.fullName ?: user?.user?.fullName.orEmpty()
    val displayEmail = profile?.email ?: user?.user?.email.orEmpty()
    val initials = (user?.user?.getInitials()
        ?: displayName.firstOrNull()?.uppercase()
        ?: "?").take(2)
    val orgName = user?.organization?.name
    val plan = user?.organization?.subscriptionPlan?.name

    GlassPanel(
        modifier = modifier.fillMaxWidth(),
        intensity = GlassIntensity.High,
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .clip(CircleShape)
                        .background(colors.accentPrimary.copy(alpha = 0.20f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = initials,
                        style = MaterialTheme.typography.titleLarge,
                        color = colors.onGlassPrimary,
                        fontWeight = FontWeight.Bold,
                    )
                }

                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    Text(
                        text = displayName.ifBlank { "Pengguna" },
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = colors.onGlassPrimary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    Text(
                        text = displayEmail,
                        style = MaterialTheme.typography.bodySmall,
                        color = colors.onGlassSecondary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }

                user?.role?.let { RoleBadge(role = it) }
            }

            if (orgName != null) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        text = "Organisasi",
                        style = MaterialTheme.typography.labelSmall,
                        color = colors.onGlassTertiary,
                    )
                    Text(
                        text = orgName,
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = colors.onGlassPrimary,
                    )
                    plan?.let {
                        Text(
                            text = "Plan: $it",
                            style = MaterialTheme.typography.labelSmall,
                            color = colors.accentPrimary,
                        )
                    }
                }
            }
        }
    }
}
