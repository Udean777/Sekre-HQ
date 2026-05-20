package org.sekre_mobile.com.presentation.task

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
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
import org.sekre_mobile.com.domain.entity.TaskStatus
import org.sekre_mobile.com.presentation.foundation.SafeArea
import org.sekre_mobile.com.presentation.foundation.formatDate
import org.sekre_mobile.com.presentation.task.components.TaskStatusChip
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TaskDetailScreen(
    state: TaskState,
    onBack: () -> Unit,
    onOpenEdit: () -> Unit,
    onEvent: (TaskEvent) -> Unit,
) {
    val selected = state.selectedTask

    SafeArea {
        if (selected == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(
                    "Tidak ada tugas yang dipilih",
                    color = SekreTheme.colors.onGlassSecondary,
                )
            }
            return@SafeArea
        }

        val task = selected.task
        var showDeleteConfirm by remember { mutableStateOf(false) }

        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Detail Tugas", fontWeight = FontWeight.SemiBold) },
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
                    TaskHeaderCard(
                        title = task.title,
                        status = task.status,
                        dueDate = task.dueDate,
                        isOverdue = task.isOverdue(),
                    )

                    // Info card
                    TaskInfoCard(
                        items = buildList {
                            add(InfoItem("Status", task.status.toLabel()))
                            add(
                                InfoItem(
                                    "Penanggung Jawab",
                                    selected.assignee?.fullName ?: "Belum ditentukan",
                                ),
                            )
                            add(
                                InfoItem(
                                    "Tanggal Jatuh Tempo",
                                    if (task.dueDate != null) formatDate(task.dueDate) else "Tidak ada",
                                ),
                            )
                            if (task.description.isNotBlank()) {
                                add(InfoItem("Deskripsi", task.description))
                            }
                            add(InfoItem("Dibuat", formatDate(task.createdAt)))
                            add(InfoItem("Diperbarui", formatDate(task.updatedAt)))
                        },
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    // Quick action: mark done
                    if (task.status != TaskStatus.DONE) {
                        Button(
                            onClick = {
                                onEvent(TaskEvent.SubmitStatus(task.id, TaskStatus.DONE))
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(50.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = SekreTheme.colors.accentSuccess,
                                contentColor = SekreTheme.colors.backdropDeep,
                            ),
                            shape = SekreTheme.shapes.medium,
                        ) {
                            Icon(
                                Icons.Default.CheckCircle,
                                contentDescription = null,
                                modifier = Modifier.size(20.dp),
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Tandai Selesai", fontWeight = FontWeight.Bold)
                        }
                    }

                    Button(
                        onClick = onOpenEdit,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = SekreTheme.shapes.medium,
                    ) {
                        Text("Edit Tugas", fontWeight = FontWeight.Bold)
                    }

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
                        Text("Hapus Tugas", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        if (showDeleteConfirm) {
            AlertDialog(
                onDismissRequest = { showDeleteConfirm = false },
                title = { Text("Hapus tugas?") },
                text = {
                    Text("Tugas \"${task.title}\" akan dihapus secara permanen. Lanjutkan?")
                },
                confirmButton = {
                    TextButton(onClick = {
                        showDeleteConfirm = false
                        onEvent(TaskEvent.SubmitDelete(task.id))
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
private fun TaskHeaderCard(
    title: String,
    status: TaskStatus,
    dueDate: Long?,
    isOverdue: Boolean,
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
                    text = "Tugas",
                    style = SekreTheme.typography.labelMedium,
                    color = SekreTheme.colors.onGlassSecondary,
                )
                TaskStatusChip(status = status)
            }
            Text(
                text = title,
                style = SekreTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = SekreTheme.colors.onGlassPrimary,
            )
            if (dueDate != null) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Text(
                        text = "Jatuh tempo ${formatDate(dueDate)}",
                        style = SekreTheme.typography.labelMedium,
                        color = if (isOverdue) SekreTheme.colors.accentDanger
                        else SekreTheme.colors.onGlassSecondary,
                    )
                    if (isOverdue) {
                        Text(
                            text = "TERLAMBAT",
                            style = SekreTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = SekreTheme.colors.accentDanger,
                        )
                    }
                }
            }
        }
    }
}

private data class InfoItem(val label: String, val value: String)

@Composable
private fun TaskInfoCard(items: List<InfoItem>) {
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
                TaskInfoRow(label = item.label, value = item.value)
                if (index != items.lastIndex) {
                    HorizontalDivider(color = SekreTheme.colors.glassBorder)
                }
            }
        }
    }
}

@Composable
private fun TaskInfoRow(label: String, value: String) {
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

internal fun TaskStatus.toLabel(): String = when (this) {
    TaskStatus.TODO -> "To Do"
    TaskStatus.IN_PROGRESS -> "In Progress"
    TaskStatus.DONE -> "Done"
}
