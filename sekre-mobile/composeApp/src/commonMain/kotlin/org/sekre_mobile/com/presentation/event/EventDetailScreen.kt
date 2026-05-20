package org.sekre_mobile.com.presentation.event

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.event.components.EventStatusChip
import org.sekre_mobile.com.presentation.event.components.displayStatus
import org.sekre_mobile.com.presentation.foundation.SafeArea
import org.sekre_mobile.com.presentation.foundation.formatDate
import org.sekre_mobile.com.presentation.foundation.formatDateTime
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme
import kotlin.math.roundToInt

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EventDetailScreen(
    state: EventState,
    onBack: () -> Unit,
    onOpenEdit: () -> Unit,
    onEvent: (EventEvent) -> Unit,
) {
    val selected = state.selectedEvent

    SafeArea {
        if (selected == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(
                    "Tidak ada acara yang dipilih",
                    color = SekreTheme.colors.onGlassSecondary,
                )
            }
            return@SafeArea
        }

        val event = selected.event
        val canEdit = event.canBeEdited()
        val canDelete = event.canBeDeleted()
        var showDeleteConfirm by remember { mutableStateOf(false) }

        // Duration label
        val durationHours = event.getDurationInHours()
        val totalMinutes = (durationHours * 60).roundToInt()
        val durationLabel = when {
            totalMinutes < 60 -> "$totalMinutes menit"
            totalMinutes % 60 == 0 -> "${totalMinutes / 60} jam"
            else -> "${totalMinutes / 60} jam ${totalMinutes % 60} menit"
        }

        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Detail Acara", fontWeight = FontWeight.SemiBold) },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(
                                Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Kembali",
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color.Transparent,
                        titleContentColor = SekreTheme.colors.onGlassPrimary,
                        navigationIconContentColor = SekreTheme.colors.onGlassPrimary,
                    ),
                )
            },
            containerColor = Color.Transparent,
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 24.dp, vertical = 16.dp),
            ) {
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    // Header card
                    EventHeaderCard(
                        title = event.title,
                        status = event,
                        startTime = event.startTime,
                        endTime = event.endTime,
                        durationLabel = durationLabel,
                    )

                    // Info card
                    EventInfoCard(
                        items = buildList {
                            add(InfoItem("Divisi", selected.division?.name ?: "-"))
                            add(InfoItem("Waktu Mulai", formatDateTime(event.startTime)))
                            add(InfoItem("Waktu Selesai", formatDateTime(event.endTime)))
                            add(InfoItem("Durasi", durationLabel))
                            if (!event.location.isNullOrBlank()) {
                                add(InfoItem("Lokasi", event.location))
                            }
                            if (event.description.isNotBlank()) {
                                add(InfoItem("Deskripsi", event.description))
                            }
                            add(InfoItem("Dibuat pada", formatDate(event.createdAt)))
                        },
                    )

                    // Notice for past events
                    if (!canEdit && event.isPast()) {
                        Text(
                            text = "Acara sudah berlalu dan tidak bisa diubah lagi.",
                            style = SekreTheme.typography.bodySmall,
                            color = SekreTheme.colors.onGlassSecondary,
                        )
                    }
                }

                if (canEdit || canDelete) {
                    Spacer(modifier = Modifier.height(16.dp))
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        if (canEdit) {
                            Button(
                                onClick = onOpenEdit,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(50.dp),
                                shape = SekreTheme.shapes.medium,
                            ) {
                                Text("Edit Acara", fontWeight = FontWeight.Bold)
                            }
                        }
                        if (canDelete) {
                            OutlinedButton(
                                onClick = { showDeleteConfirm = true },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(50.dp),
                                shape = SekreTheme.shapes.medium,
                                colors = ButtonDefaults.outlinedButtonColors(
                                    contentColor = SekreTheme.colors.accentDanger,
                                ),
                            ) {
                                Text("Hapus Acara", fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }

        if (showDeleteConfirm) {
            AlertDialog(
                onDismissRequest = { showDeleteConfirm = false },
                title = { Text("Hapus acara?") },
                text = {
                    Text(
                        "Acara \"${event.title}\" akan dihapus secara permanen. Lanjutkan?",
                    )
                },
                confirmButton = {
                    TextButton(onClick = {
                        showDeleteConfirm = false
                        onEvent(EventEvent.SubmitDelete(event.id))
                        onBack()
                    }) {
                        Text("Hapus", color = SekreTheme.colors.accentDanger)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showDeleteConfirm = false }) { Text("Batal") }
                },
            )
        }
    }
}

// ── Private composables ───────────────────────────────────────────────────────

@Composable
private fun EventHeaderCard(
    title: String,
    status: org.sekre_mobile.com.domain.entity.Event,
    startTime: Long,
    endTime: Long,
    durationLabel: String,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = SekreTheme.shapes.large,
        colors = CardDefaults.cardColors(containerColor = SekreTheme.colors.glassTint),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text(
                    text = "Acara",
                    style = SekreTheme.typography.labelMedium,
                    color = SekreTheme.colors.onGlassSecondary,
                )
                EventStatusChip(status = status.displayStatus())
            }
            Text(
                text = title,
                style = SekreTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = SekreTheme.colors.onGlassPrimary,
            )
            Text(
                text = "${formatDateTime(startTime)} – ${formatDateTime(endTime)}",
                style = SekreTheme.typography.bodySmall,
                color = SekreTheme.colors.onGlassSecondary,
            )
            Text(
                text = "Durasi $durationLabel",
                style = SekreTheme.typography.labelMedium,
                color = SekreTheme.colors.onGlassSecondary,
            )
        }
    }
}

private data class InfoItem(val label: String, val value: String)

@Composable
private fun EventInfoCard(items: List<InfoItem>) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = SekreTheme.shapes.large,
        colors = CardDefaults.cardColors(containerColor = SekreTheme.colors.glassTint),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 8.dp),
        ) {
            items.forEachIndexed { index, item ->
                EventInfoRow(label = item.label, value = item.value)
                if (index != items.lastIndex) {
                    HorizontalDivider(color = SekreTheme.colors.glassBorder)
                }
            }
        }
    }
}

@Composable
private fun EventInfoRow(label: String, value: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Text(
            text = label,
            style = SekreTheme.typography.labelMedium,
            color = SekreTheme.colors.onGlassSecondary,
        )
        Text(
            text = value,
            style = SekreTheme.typography.bodyMedium,
            fontWeight = FontWeight.Medium,
            color = SekreTheme.colors.onGlassPrimary,
        )
    }
}
