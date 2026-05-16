package org.sekre_mobile.com.presentation.dashboard.components

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
import org.sekre_mobile.com.domain.entity.AuthenticatedUser
import org.sekre_mobile.com.domain.entity.FinanceSummary

@Composable
fun DashboardInfoSection(
    user: AuthenticatedUser?,
    summary: FinanceSummary?,
    isWide: Boolean
) {
    val infoCards = buildList {
        user?.let {
            add(
                "Profil Organisasi" to listOf(
                    "Nama: ${it.organization.name}",
                    "Peran: ${it.role}",
                    "Akun: ${it.user.email}",
                )
            )
        }

        add(
            "Status Sistem" to listOf(
                if (summary == null) "Data keuangan belum disinkronisasi." else "Sinkronisasi data keuangan berhasil.",
                "Terakhir diperbarui: Baru saja",
            )
        )
    }

    if (isWide && infoCards.size >= 2) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            infoCards.forEach { (title, lines) ->
                InfoCard(title, lines, Modifier.weight(1f))
            }
        }
    } else {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            infoCards.forEach { (title, lines) ->
                InfoCard(title, lines, Modifier.fillMaxWidth())
            }
        }
    }
}

@Composable
private fun InfoCard(
    title: String,
    lines: List<String>,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall,
                color = MaterialTheme.colorScheme.onSurface,
                fontWeight = FontWeight.SemiBold,
            )

            lines.forEach { line ->
                Text(
                    text = line,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}