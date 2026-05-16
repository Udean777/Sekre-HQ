package org.sekre_mobile.com.presentation.event

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.event.components.DateTimePickerDialog
import org.sekre_mobile.com.presentation.event.components.EventStatusChip
import org.sekre_mobile.com.presentation.event.components.displayStatus
import org.sekre_mobile.com.presentation.foundation.SafeArea
import org.sekre_mobile.com.presentation.foundation.formatDateTime

private const val ONE_HOUR_MS: Long = 60 * 60 * 1000

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EventDetailScreen(
    state: EventState,
    onBack: () -> Unit,
    onEvent: (EventEvent) -> Unit,
) {
    val selected = state.selectedEvent

    SafeArea(applyImePadding = true) {
        if (selected == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(
                    "Tidak ada acara yang dipilih",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            return@SafeArea
        }

        var editTitle by remember(selected.event.id) { mutableStateOf(selected.event.title) }
        var editDescription by remember(selected.event.id) { mutableStateOf(selected.event.description) }
        var editLocation by remember(selected.event.id) { mutableStateOf(selected.event.location.orEmpty()) }
        var editStartTime by remember(selected.event.id) { mutableStateOf(selected.event.startTime) }
        var editEndTime by remember(selected.event.id) { mutableStateOf(selected.event.endTime) }
        var editDivisionId by remember(selected.event.id) { mutableStateOf(selected.event.divisionId) }
        var editDivisionName by remember(selected.event.id) {
            mutableStateOf(selected.division?.name.orEmpty())
        }

        var divisionDropdownExpanded by remember { mutableStateOf(false) }
        var startPickerOpen by remember { mutableStateOf(false) }
        var endPickerOpen by remember { mutableStateOf(false) }
        var showDeleteConfirm by remember { mutableStateOf(false) }

        val canEdit = selected.event.canBeEdited()
        val canDelete = selected.event.canBeDeleted()

        val isValid = editTitle.isNotBlank() && editDivisionId.isNotBlank() && editEndTime > editStartTime

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
                        containerColor = MaterialTheme.colorScheme.background,
                    ),
                )
            },
            containerColor = MaterialTheme.colorScheme.background,
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 24.dp, vertical = 16.dp),
                verticalArrangement = Arrangement.SpaceBetween,
            ) {
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Text(
                            text = "Status",
                            style = MaterialTheme.typography.titleSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                        EventStatusChip(status = selected.event.displayStatus())
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

                    // Division dropdown
                    Box(modifier = Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable(enabled = canEdit) { divisionDropdownExpanded = true },
                            value = editDivisionName,
                            onValueChange = {},
                            readOnly = true,
                            enabled = false,
                            label = { Text("Divisi *") },
                            trailingIcon = {
                                Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                            },
                            shape = RoundedCornerShape(12.dp),
                        )
                        DropdownMenu(
                            expanded = divisionDropdownExpanded,
                            onDismissRequest = { divisionDropdownExpanded = false },
                            modifier = Modifier.fillMaxWidth(0.9f),
                        ) {
                            state.divisions.forEach { division ->
                                DropdownMenuItem(
                                    text = { Text(division.name) },
                                    onClick = {
                                        editDivisionId = division.id
                                        editDivisionName = division.name
                                        divisionDropdownExpanded = false
                                    },
                                )
                            }
                        }
                    }

                    OutlinedTextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = editTitle,
                        onValueChange = { editTitle = it },
                        readOnly = !canEdit,
                        label = { Text("Judul Acara *") },
                        shape = RoundedCornerShape(12.dp),
                    )

                    OutlinedTextField(
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(min = 120.dp),
                        value = editDescription,
                        onValueChange = { editDescription = it },
                        readOnly = !canEdit,
                        label = { Text("Deskripsi") },
                        shape = RoundedCornerShape(12.dp),
                        maxLines = 5,
                    )

                    OutlinedTextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = editLocation,
                        onValueChange = { editLocation = it },
                        readOnly = !canEdit,
                        label = { Text("Lokasi") },
                        shape = RoundedCornerShape(12.dp),
                    )

                    OutlinedTextField(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(enabled = canEdit) { startPickerOpen = true },
                        value = formatDateTime(editStartTime),
                        onValueChange = {},
                        readOnly = true,
                        enabled = false,
                        label = { Text("Waktu Mulai *") },
                        trailingIcon = {
                            IconButton(
                                onClick = { startPickerOpen = true },
                                enabled = canEdit,
                            ) {
                                Icon(Icons.Default.Schedule, contentDescription = "Pilih waktu mulai")
                            }
                        },
                        shape = RoundedCornerShape(12.dp),
                    )

                    OutlinedTextField(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(enabled = canEdit) { endPickerOpen = true },
                        value = formatDateTime(editEndTime),
                        onValueChange = {},
                        readOnly = true,
                        enabled = false,
                        label = { Text("Waktu Selesai *") },
                        trailingIcon = {
                            IconButton(
                                onClick = { endPickerOpen = true },
                                enabled = canEdit,
                            ) {
                                Icon(Icons.Default.Schedule, contentDescription = "Pilih waktu selesai")
                            }
                        },
                        shape = RoundedCornerShape(12.dp),
                    )

                    if (editEndTime <= editStartTime) {
                        Text(
                            text = "Waktu selesai harus setelah waktu mulai.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.error,
                        )
                    }
                }

                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    if (canEdit) {
                        Button(
                            onClick = {
                                onEvent(
                                    EventEvent.SubmitEdit(
                                        id = selected.event.id,
                                        divisionId = editDivisionId,
                                        title = editTitle,
                                        description = editDescription.ifBlank { null },
                                        startTime = editStartTime,
                                        endTime = editEndTime,
                                        location = editLocation.ifBlank { null },
                                    ),
                                )
                                onBack()
                            },
                            enabled = isValid,
                            modifier = Modifier.fillMaxWidth().height(50.dp),
                            shape = RoundedCornerShape(12.dp),
                        ) {
                            Text("Simpan Perubahan", fontWeight = FontWeight.Bold)
                        }
                    }

                    if (canDelete) {
                        OutlinedButton(
                            onClick = { showDeleteConfirm = true },
                            modifier = Modifier.fillMaxWidth().height(50.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = MaterialTheme.colorScheme.error,
                            ),
                        ) {
                            Text("Hapus Acara", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        if (startPickerOpen) {
            DateTimePickerDialog(
                initialEpochMillis = editStartTime,
                onDismiss = { startPickerOpen = false },
                onConfirm = { picked ->
                    editStartTime = picked
                    if (editEndTime <= picked) {
                        editEndTime = picked + ONE_HOUR_MS
                    }
                    startPickerOpen = false
                },
            )
        }

        if (endPickerOpen) {
            DateTimePickerDialog(
                initialEpochMillis = editEndTime,
                onDismiss = { endPickerOpen = false },
                onConfirm = { picked ->
                    editEndTime = picked
                    endPickerOpen = false
                },
            )
        }

        if (showDeleteConfirm) {
            AlertDialog(
                onDismissRequest = { showDeleteConfirm = false },
                title = { Text("Hapus acara?") },
                text = { Text("Acara \"${selected.event.title}\" akan dihapus secara permanen. Lanjutkan?") },
                confirmButton = {
                    TextButton(onClick = {
                        showDeleteConfirm = false
                        onEvent(EventEvent.SubmitDelete(selected.event.id))
                        onBack()
                    }) {
                        Text("Hapus", color = MaterialTheme.colorScheme.error)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { showDeleteConfirm = false }) { Text("Batal") }
                },
            )
        }
    }
}
