package org.sekre_mobile.com.presentation.event

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
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
import org.sekre_mobile.com.presentation.event.components.DateTimePickerDialog
import org.sekre_mobile.com.presentation.foundation.SafeArea
import org.sekre_mobile.com.presentation.foundation.formatDateTime
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

private const val ONE_HOUR_MS: Long = 60 * 60 * 1000

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EventEditScreen(
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
                    color = SekreTheme.colors.onGlassSecondary,
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

        val isValid = editTitle.isNotBlank() && editDivisionId.isNotBlank() && editEndTime > editStartTime

        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Edit Acara", fontWeight = FontWeight.SemiBold) },
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
                verticalArrangement = Arrangement.SpaceBetween,
            ) {
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    // Division dropdown
                    Box(modifier = Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { divisionDropdownExpanded = true },
                            value = editDivisionName,
                            onValueChange = {},
                            readOnly = true,
                            enabled = false,
                            label = { Text("Divisi *") },
                            trailingIcon = {
                                Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                            },
                            shape = SekreTheme.shapes.medium,
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
                        label = { Text("Judul Acara *") },
                        shape = SekreTheme.shapes.medium,
                    )

                    OutlinedTextField(
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(min = 120.dp),
                        value = editDescription,
                        onValueChange = { editDescription = it },
                        label = { Text("Deskripsi") },
                        shape = SekreTheme.shapes.medium,
                        maxLines = 5,
                    )

                    OutlinedTextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = editLocation,
                        onValueChange = { editLocation = it },
                        label = { Text("Lokasi") },
                        shape = SekreTheme.shapes.medium,
                    )

                    OutlinedTextField(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { startPickerOpen = true },
                        value = formatDateTime(editStartTime),
                        onValueChange = {},
                        readOnly = true,
                        enabled = false,
                        label = { Text("Waktu Mulai *") },
                        trailingIcon = {
                            IconButton(onClick = { startPickerOpen = true }) {
                                Icon(Icons.Default.Schedule, contentDescription = "Pilih waktu mulai")
                            }
                        },
                        shape = SekreTheme.shapes.medium,
                    )

                    OutlinedTextField(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { endPickerOpen = true },
                        value = formatDateTime(editEndTime),
                        onValueChange = {},
                        readOnly = true,
                        enabled = false,
                        label = { Text("Waktu Selesai *") },
                        trailingIcon = {
                            IconButton(onClick = { endPickerOpen = true }) {
                                Icon(Icons.Default.Schedule, contentDescription = "Pilih waktu selesai")
                            }
                        },
                        shape = SekreTheme.shapes.medium,
                    )

                    if (editEndTime <= editStartTime) {
                        Text(
                            text = "Waktu selesai harus setelah waktu mulai.",
                            style = MaterialTheme.typography.bodySmall,
                            color = SekreTheme.colors.accentDanger,
                        )
                    }
                }

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
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = SekreTheme.shapes.medium,
                ) {
                    Text("Simpan Perubahan", fontWeight = FontWeight.Bold)
                }
            }
        }

        if (startPickerOpen) {
            DateTimePickerDialog(
                initialEpochMillis = editStartTime,
                onDismiss = { startPickerOpen = false },
                onConfirm = { picked ->
                    editStartTime = picked
                    if (editEndTime <= picked) editEndTime = picked + ONE_HOUR_MS
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
    }
}
