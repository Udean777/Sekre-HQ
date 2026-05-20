package org.sekre_mobile.com.presentation.dashboard.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.sekre_mobile.com.domain.entity.AuthenticatedUser
import org.sekre_mobile.com.domain.entity.FinanceSummary
import org.sekre_mobile.com.domain.util.formatMoney
import org.sekre_mobile.com.presentation.ui.glass.GlassPanel
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

@Composable
fun DashboardHeroCard(
    user: AuthenticatedUser?,
    summary: FinanceSummary?,
) {
    val colors = SekreTheme.colors
    val shapes = SekreTheme.shapes
    val typography = SekreTheme.typography
    val spacing = SekreTheme.spacing

    GlassPanel(
        modifier = Modifier.fillMaxWidth(),
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(spacing.sm),
        ) {
            // ── Top row: org name + role badge ──────────────────────────────
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = user?.organization?.name ?: "Organisasi",
                    style = typography.titleSmall,
                    color = colors.onSurfaceSecondary,
                    modifier = Modifier.weight(1f),
                )

                if (user != null) {
                    Box(
                        modifier = Modifier
                            .clip(shapes.small)
                            .background(colors.accentPrimary.copy(alpha = 0.10f))
                            .padding(horizontal = 10.dp, vertical = 4.dp),
                    ) {
                        Text(
                            text = user.role.name,
                            style = typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = colors.accentPrimary,
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(spacing.lg))

            // ── Balance label ────────────────────────────────────────────────
            Text(
                text = "TOTAL SALDO",
                style = typography.labelMedium.copy(
                    letterSpacing = 1.sp,
                ),
                color = colors.onSurfaceTertiary,
            )

            // ── Balance value ────────────────────────────────────────────────
            val balanceText = if (summary != null) {
                val netCents = summary.totalIncomeCents - summary.totalExpenseCents
                formatMoney(netCents, summary.currency)
            } else {
                "—"
            }

            Text(
                text = balanceText,
                style = typography.displayMedium,
                fontWeight = FontWeight.ExtraBold,
                color = colors.onSurfacePrimary,
            )
        }
    }
}
