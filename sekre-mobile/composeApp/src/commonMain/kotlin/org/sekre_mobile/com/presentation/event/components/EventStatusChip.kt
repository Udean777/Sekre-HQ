package org.sekre_mobile.com.presentation.event.components

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import org.sekre_mobile.com.domain.entity.Event
import org.sekre_mobile.com.presentation.ui.glass.GlassPill
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

/** Visual derived state for an event, used to drive the chip. */
enum class EventDisplayStatus { Ongoing, Today, Upcoming, Past }

fun Event.displayStatus(): EventDisplayStatus = when {
    isOngoing() -> EventDisplayStatus.Ongoing
    isToday() && !isPast() -> EventDisplayStatus.Today
    isUpcoming() -> EventDisplayStatus.Upcoming
    else -> EventDisplayStatus.Past
}

@Composable
fun EventStatusChip(status: EventDisplayStatus) {
    val colors = SekreTheme.colors

    val (accentColor: Color, label: String) = when (status) {
        EventDisplayStatus.Ongoing  -> colors.accentSuccess  to "Berlangsung"
        EventDisplayStatus.Today    -> colors.accentWarning  to "Hari Ini"
        EventDisplayStatus.Upcoming -> colors.accentPrimary  to "Akan Datang"
        EventDisplayStatus.Past     -> colors.onGlassTertiary to "Selesai"
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
