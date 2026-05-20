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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import kotlinx.datetime.Instant
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import org.sekre_mobile.com.domain.entity.EventWithDivision
import org.sekre_mobile.com.domain.entity.TaskStatus
import org.sekre_mobile.com.domain.entity.TaskWithAssignee
import org.sekre_mobile.com.domain.util.currentTimeMillis
import org.sekre_mobile.com.presentation.foundation.formatDate
import org.sekre_mobile.com.presentation.ui.glass.GlassCard
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

// ── Month names (Bahasa Indonesia, 3-char) ────────────────────────────────────
private val ID_MONTHS_SHORT = arrayOf(
    "JAN", "FEB", "MAR", "APR", "MEI", "JUN",
    "JUL", "AGU", "SEP", "OKT", "NOV", "DES",
)

// ── Relative time label for task created-at ───────────────────────────────────
private fun relativeTimeLabel(epochMillis: Long): String {
    val now      = currentTimeMillis()
    val diffMs   = now - epochMillis
    val diffMin  = diffMs / 60_000L
    val diffHour = diffMs / 3_600_000L
    val diffDay  = diffMs / 86_400_000L
    return when {
        diffMin < 1   -> "Baru saja"
        diffMin < 60  -> "$diffMin menit lalu"
        diffHour < 24 -> "$diffHour jam lalu"
        diffDay == 1L -> "Kemarin"
        diffDay < 30  -> "$diffDay hari lalu"
        else          -> formatDate(epochMillis)
    }
}

// ── Extract day + month from epoch millis ─────────────────────────────────────
private fun extractDayMonth(epochMillis: Long): Pair<String, String> {
    val instant = Instant.fromEpochMilliseconds(epochMillis)
    val local   = instant.toLocalDateTime(TimeZone.currentSystemDefault())
    val day     = local.dayOfMonth.toString().padStart(2, '0')
    val month   = ID_MONTHS_SHORT[local.monthNumber - 1]
    return day to month
}

// ── Format HH:mm from epoch millis ───────────────────────────────────────────
private fun formatTime(epochMillis: Long): String {
    val instant = Instant.fromEpochMilliseconds(epochMillis)
    val local   = instant.toLocalDateTime(TimeZone.currentSystemDefault())
    val h = local.hour.toString().padStart(2, '0')
    val m = local.minute.toString().padStart(2, '0')
    return "$h:$m"
}

// ─────────────────────────────────────────────────────────────────────────────
// Entry composable
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun DashboardListsSection(
    tasks: List<TaskWithAssignee>,
    events: List<EventWithDivision>,
    isWide: Boolean,
    modifier: Modifier = Modifier,
) {
    if (isWide) {
        Row(
            modifier = modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            TasksCard(tasks = tasks, modifier = Modifier.weight(1f))
            EventsCard(events = events, modifier = Modifier.weight(1f))
        }
    } else {
        Column(
            modifier = modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            TasksCard(tasks = tasks)
            EventsCard(events = events)
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tasks card
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun TasksCard(
    tasks: List<TaskWithAssignee>,
    modifier: Modifier = Modifier,
) {
    val colors     = SekreTheme.colors
    val typography = SekreTheme.typography
    val spacing    = SekreTheme.spacing

    GlassCard(modifier = modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(spacing.md),
        ) {
            // Header
            Text(
                text = "Tugas Terbaru",
                style = typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = colors.onSurfacePrimary,
            )

            if (tasks.isEmpty()) {
                Text(
                    text = "Tidak ada tugas.",
                    style = typography.bodySmall,
                    color = colors.onSurfaceTertiary,
                )
            } else {
                tasks.forEachIndexed { index, item ->
                    TaskRow(item = item)
                    if (index != tasks.lastIndex) {
                        HorizontalDivider(
                            color = colors.surfaceBorder,
                            thickness = 0.5.dp,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun TaskRow(item: TaskWithAssignee) {
    val colors     = SekreTheme.colors
    val typography = SekreTheme.typography
    val task       = item.task

    // Status dot color
    val dotColor = when {
        task.isOverdue()              -> colors.accentDanger
        task.status == TaskStatus.DONE        -> colors.accentSuccess
        task.status == TaskStatus.IN_PROGRESS -> colors.accentPrimary
        else                                  -> colors.accentWarning
    }

    // Status label
    val statusLabel = when (task.status) {
        TaskStatus.TODO        -> "TODO"
        TaskStatus.IN_PROGRESS -> "PROSES"
        TaskStatus.DONE        -> "SELESAI"
    }

    val statusColor = when (task.status) {
        TaskStatus.DONE        -> colors.accentSuccess
        TaskStatus.IN_PROGRESS -> colors.accentPrimary
        TaskStatus.TODO        -> colors.accentWarning
    }

    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Status dot
        Box(
            modifier = Modifier
                .size(8.dp)
                .clip(SekreTheme.shapes.pill)
                .background(dotColor),
        )

        Spacer(modifier = Modifier.width(12.dp))

        // Title + created-at
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = task.title,
                style = typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                color = colors.onSurfacePrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = relativeTimeLabel(task.createdAt),
                style = typography.bodySmall,
                color = colors.onSurfaceTertiary,
            )
        }

        Spacer(modifier = Modifier.width(8.dp))

        // Status pill
        Box(
            modifier = Modifier
                .clip(SekreTheme.shapes.pill)
                .background(statusColor.copy(alpha = 0.10f))
                .padding(horizontal = 8.dp, vertical = 3.dp),
        ) {
            Text(
                text = statusLabel,
                style = typography.labelSmall,
                fontWeight = FontWeight.Bold,
                color = statusColor,
            )
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Events card
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun EventsCard(
    events: List<EventWithDivision>,
    modifier: Modifier = Modifier,
) {
    val colors     = SekreTheme.colors
    val typography = SekreTheme.typography
    val spacing    = SekreTheme.spacing

    GlassCard(modifier = modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(spacing.md),
        ) {
            // Header
            Text(
                text = "Acara Mendatang",
                style = typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = colors.onSurfacePrimary,
            )

            if (events.isEmpty()) {
                Text(
                    text = "Tidak ada acara mendatang.",
                    style = typography.bodySmall,
                    color = colors.onSurfaceTertiary,
                )
            } else {
                events.forEachIndexed { index, item ->
                    EventRow(item = item)
                    if (index != events.lastIndex) {
                        HorizontalDivider(
                            color = colors.surfaceBorder,
                            thickness = 0.5.dp,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun EventRow(item: EventWithDivision) {
    val colors     = SekreTheme.colors
    val typography = SekreTheme.typography
    val event      = item.event

    val (day, month) = extractDayMonth(event.startTime)
    val timeLabel    = buildString {
        append(formatTime(event.startTime))
        append(" - ")
        append(formatTime(event.endTime))
        if (!event.location.isNullOrBlank()) {
            append(" · ")
            append(event.location)
        }
    }

    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // Date block
        Box(
            modifier = Modifier
                .size(44.dp)
                .clip(SekreTheme.shapes.medium)
                .background(colors.accentPrimary.copy(alpha = 0.10f)),
            contentAlignment = Alignment.Center,
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = day,
                    style = typography.titleMedium,
                    fontWeight = FontWeight.ExtraBold,
                    color = colors.accentPrimary,
                )
                Text(
                    text = month,
                    style = typography.labelSmall,
                    fontWeight = FontWeight.Medium,
                    color = colors.accentPrimary,
                )
            }
        }

        Spacer(modifier = Modifier.width(12.dp))

        // Title + time
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = event.title,
                style = typography.bodyMedium,
                fontWeight = FontWeight.Medium,
                color = colors.onSurfacePrimary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Text(
                text = timeLabel,
                style = typography.bodySmall,
                color = colors.onSurfaceTertiary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}
