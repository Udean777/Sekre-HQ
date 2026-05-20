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
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.event.components.DateTimePickerDialog
import org.sekre_mobile.com.presentation.foundation.SafeArea
import org.sekre_mobile.com.presentation.foundation.formatDateTime

private const val ONE_HOUR_MS: Long = 60 * 60 * 1000

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EventCreateScreen(
    state: EventState,
    onBack: () -> Unit,
    onEvent: (EventEvent) -> Unit,
) {
    var selectedDivisionId by remember { mutableStateOf("") }
    var selectedDivisionName by remember { mutableStateOf("") }
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var location by remember { mutableStateOf("") }
    var startTime by remember { mutableStateOf<Long?>(null) }
    var endTime by remember { mutableStateOf<Long?>(null) }

    var divisionDropdownExpanded by remember { mutableStateOf(false) }
    var startPickerOpen by remember { mutableStateOf(false) }
    var endPickerOpen by remember { mutableStateOf(false) }

    val canSubmit = selectedDivisionId.isNotBlank()
        && title.isNotBlank()
        && startTime != null
        && endTime != null
        && (endTime ?: 0L) > (startTime ?: 0L)

    SafeArea(applyImePadding = true) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Buat Acara Baru", fontWeight = FontWeight.SemiBold) },
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
                    // Division dropdown
                    Box(modifier = Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { divisionDropdownExpanded = true },
                            value = selectedDivisionName,
                            onValueChange = {},
                            readOnly = true,
                            enabled = false,
                            label = { Text("Divisi *") },
                            placeholder = {
                                Text(
                                    if (state.isLoadingDivisions) "Memuat divisi..."
                                    else "Pilih divisi",
                                )
                            },
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
                            if (state.divisions.isEmpty() && !state.isLoadingDivisions) {
                                DropdownMenuItem(
                                    text = { Text("Tidak ada divisi") },
                                    onClick = { divisionDropdownExpanded = false },
                                    enabled = false,
                                )
                            }
                            state.divisions.forEach { division ->
                                DropdownMenuItem(
                                    text = { Text(division.name) },
                                    onClick = {
                                        selectedDivisionId = division.id
                                        selectedDivisionName = division.name
                                        divisionDropdownExpanded = false
                                    },
                                )
                            }
                        }
                    }

                    OutlinedTextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Judul Acara *") },
                        shape = RoundedCornerShape(12.dp),
                    )

                    OutlinedTextField(
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(min = 120.dp),
                        value = description,
                        onValueChange = { description = it },
                        label = { Text("Deskripsi") },
                        shape = RoundedCornerShape(12.dp),
                        maxLines = 5,
                    )

                    OutlinedTextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = location,
                        onValueChange = { location = it },
                        label = { Text("Lokasi") },
                        shape = RoundedCornerShape(12.dp),
                    )

                    // Start time
                    OutlinedTextField(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { startPickerOpen = true },
                        value = formatDateTime(startTime),
                        onValueChange = {},
                        readOnly = true,
                        enabled = false,
                        label = { Text("Waktu Mulai *") },
                        placeholder = { Text("Pilih tanggal & jam") },
                        trailingIcon = {
                            IconButton(onClick = { startPickerOpen = true }) {
                                Icon(Icons.Default.Schedule, contentDescription = "Pilih waktu mulai")
                            }
                        },
                        shape = RoundedCornerShape(12.dp),
                    )

                    // End time
                    OutlinedTextField(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { endPickerOpen = true },
                        value = formatDateTime(endTime),
                        onValueChange = {},
                        readOnly = true,
                        enabled = false,
                        label = { Text("Waktu Selesai *") },
                        placeholder = { Text("Pilih tanggal & jam") },
                        trailingIcon = {
                            IconButton(onClick = { endPickerOpen = true }) {
                                Icon(Icons.Default.Schedule, contentDescription = "Pilih waktu selesai")
                            }
                        },
                        shape = RoundedCornerShape(12.dp),
                    )

                    if (startTime != null && endTime != null && (endTime ?: 0) <= (startTime ?: 0)) {
                        Text(
                            text = "Waktu selesai harus setelah waktu mulai.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.error,
                        )
                    }
                }

                Button(
                    onClick = {
                        val s = startTime ?: return@Button
                        val e = endTime ?: return@Button
                        onEvent(
                            EventEvent.SubmitCreate(
                                divisionId = selectedDivisionId,
                                title = title,
                                description = description.ifBlank { null },
                                startTime = s,
                                endTime = e,
                                location = location.ifBlank { null },
                            ),
                        )
                        onBack()
                    },
                    enabled = canSubmit,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                ) {
                    Text("Simpan Acara", fontWeight = FontWeight.Bold)
                }
            }
        }
    }

    if (startPickerOpen) {
        DateTimePickerDialog(
            initialEpochMillis = startTime,
            onDismiss = { startPickerOpen = false },
            onConfirm = { picked ->
                startTime = picked
                if (endTime == null || (endTime ?: 0L) <= picked) {
                    endTime = picked + ONE_HOUR_MS
                }
                startPickerOpen = false
            },
        )
    }

    if (endPickerOpen) {
        DateTimePickerDialog(
            initialEpochMillis = endTime ?: startTime?.plus(ONE_HOUR_MS),
            onDismiss = { endPickerOpen = false },
            onConfirm = { picked ->
                endTime = picked
                endPickerOpen = false
            },
        )
    }
}
