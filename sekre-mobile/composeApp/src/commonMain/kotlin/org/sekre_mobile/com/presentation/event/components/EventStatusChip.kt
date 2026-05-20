package org.sekre_mobile.com.presentation.event.components

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.domain.entity.Event

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
    val containerColor: Color
    val contentColor: Color
    val label: String

    when (status) {
        EventDisplayStatus.Ongoing -> {
            containerColor = MaterialTheme.colorScheme.tertiaryContainer
            contentColor = MaterialTheme.colorScheme.onTertiaryContainer
            label = "Berlangsung"
        }
        EventDisplayStatus.Today -> {
            containerColor = MaterialTheme.colorScheme.secondaryContainer
            contentColor = MaterialTheme.colorScheme.onSecondaryContainer
            label = "Hari Ini"
        }
        EventDisplayStatus.Upcoming -> {
            containerColor = MaterialTheme.colorScheme.primaryContainer
            contentColor = MaterialTheme.colorScheme.onPrimaryContainer
            label = "Akan Datang"
        }
        EventDisplayStatus.Past -> {
            containerColor = MaterialTheme.colorScheme.surfaceVariant
            contentColor = MaterialTheme.colorScheme.onSurfaceVariant
            label = "Selesai"
        }
    }

    Surface(
        color = containerColor,
        shape = RoundedCornerShape(8.dp),
    ) {
        Text(
            text = label,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold,
            color = contentColor,
        )
    }
}
