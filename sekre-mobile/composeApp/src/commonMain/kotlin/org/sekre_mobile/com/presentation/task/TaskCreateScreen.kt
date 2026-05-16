package org.sekre_mobile.com.presentation.task

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
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.foundation.SafeArea
import org.sekre_mobile.com.presentation.foundation.formatDate

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TaskCreateScreen(
    state: TaskState,
    onBack: () -> Unit,
    onEvent: (TaskEvent) -> Unit
) {
    var selectedDivisionId by remember { mutableStateOf("") }
    var selectedDivisionName by remember { mutableStateOf("") }
    var selectedAssigneeId by remember { mutableStateOf<String?>(null) }
    var selectedAssigneeName by remember { mutableStateOf("") }
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var dueDate by remember { mutableStateOf<Long?>(null) }

    var divisionDropdownExpanded by remember { mutableStateOf(false) }
    var assigneeDropdownExpanded by remember { mutableStateOf(false) }
    var showDatePicker by remember { mutableStateOf(false) }

    // When user picks a division, ask the VM to load that division's members.
    LaunchedEffect(selectedDivisionId) {
        if (selectedDivisionId.isNotBlank()) {
            onEvent(TaskEvent.LoadDivisionMembers(selectedDivisionId))
            // Reset assignee whenever division changes.
            selectedAssigneeId = null
            selectedAssigneeName = ""
        }
    }

    val canSubmit = selectedDivisionId.isNotBlank() && title.isNotBlank()

    SafeArea(applyImePadding = true) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Buat Tugas Baru", fontWeight = FontWeight.SemiBold) },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(
                                Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Kembali"
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.background
                    )
                )
            },
            containerColor = MaterialTheme.colorScheme.background
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 24.dp, vertical = 16.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
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
                                    else "Pilih divisi"
                                )
                            },
                            trailingIcon = {
                                Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                            },
                            shape = RoundedCornerShape(12.dp)
                        )
                        DropdownMenu(
                            expanded = divisionDropdownExpanded,
                            onDismissRequest = { divisionDropdownExpanded = false },
                            modifier = Modifier.fillMaxWidth(0.9f)
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
                                    }
                                )
                            }
                        }
                    }

                    // Assignee dropdown (depends on division selection)
                    Box(modifier = Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable(enabled = selectedDivisionId.isNotBlank()) {
                                    assigneeDropdownExpanded = true
                                },
                            value = selectedAssigneeName,
                            onValueChange = {},
                            readOnly = true,
                            enabled = false,
                            label = { Text("Penanggung Jawab (opsional)") },
                            placeholder = {
                                Text(
                                    when {
                                        selectedDivisionId.isBlank() -> "Pilih divisi dulu"
                                        state.isLoadingMembers -> "Memuat anggota..."
                                        state.divisionMembers.isEmpty() -> "Belum ada anggota"
                                        else -> "Pilih anggota"
                                    }
                                )
                            },
                            trailingIcon = {
                                if (selectedAssigneeId != null) {
                                    IconButton(onClick = {
                                        selectedAssigneeId = null
                                        selectedAssigneeName = ""
                                    }) {
                                        Icon(Icons.Default.Close, contentDescription = "Hapus")
                                    }
                                } else {
                                    Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                                }
                            },
                            shape = RoundedCornerShape(12.dp)
                        )
                        DropdownMenu(
                            expanded = assigneeDropdownExpanded,
                            onDismissRequest = { assigneeDropdownExpanded = false },
                            modifier = Modifier.fillMaxWidth(0.9f)
                        ) {
                            state.divisionMembers.forEach { member ->
                                DropdownMenuItem(
                                    text = { Text("${member.fullName} (${member.divisionRole})") },
                                    onClick = {
                                        selectedAssigneeId = member.id
                                        selectedAssigneeName = member.fullName
                                        assigneeDropdownExpanded = false
                                    }
                                )
                            }
                        }
                    }

                    OutlinedTextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = title,
                        onValueChange = { title = it },
                        label = { Text("Judul Tugas *") },
                        shape = RoundedCornerShape(12.dp)
                    )

                    OutlinedTextField(
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(min = 120.dp),
                        value = description,
                        onValueChange = { description = it },
                        label = { Text("Deskripsi") },
                        shape = RoundedCornerShape(12.dp),
                        maxLines = 5
                    )

                    // Due date picker trigger
                    OutlinedTextField(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { showDatePicker = true },
                        value = formatDate(dueDate),
                        onValueChange = {},
                        readOnly = true,
                        enabled = false,
                        label = { Text("Tanggal Jatuh Tempo (opsional)") },
                        placeholder = { Text("Pilih tanggal") },
                        trailingIcon = {
                            if (dueDate != null) {
                                IconButton(onClick = { dueDate = null }) {
                                    Icon(Icons.Default.Close, contentDescription = "Hapus")
                                }
                            } else {
                                IconButton(onClick = { showDatePicker = true }) {
                                    Icon(
                                        Icons.Default.CalendarMonth,
                                        contentDescription = "Pilih tanggal"
                                    )
                                }
                            }
                        },
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                Button(
                    onClick = {
                        onEvent(
                            TaskEvent.SubmitCreate(
                                divisionId = selectedDivisionId,
                                title = title,
                                description = description.ifBlank { null },
                                assigneeId = selectedAssigneeId,
                                dueDate = dueDate,
                            )
                        )
                        onBack()
                    },
                    enabled = canSubmit,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Simpan Tugas", fontWeight = FontWeight.Bold)
                }
            }
        }
    }

    if (showDatePicker) {
        val datePickerState = rememberDatePickerState(initialSelectedDateMillis = dueDate)
        DatePickerDialog(
            onDismissRequest = { showDatePicker = false },
            confirmButton = {
                TextButton(onClick = {
                    dueDate = datePickerState.selectedDateMillis?.let { it + END_OF_DAY_OFFSET_MS }
                    showDatePicker = false
                }) { Text("OK") }
            },
            dismissButton = {
                TextButton(onClick = { showDatePicker = false }) { Text("Batal") }
            }
        ) {
            DatePicker(state = datePickerState)
        }
    }
}

/** 23h 59m 59s in millis – pushes a picked date to end-of-day. */
internal const val END_OF_DAY_OFFSET_MS: Long = 86_399_000L
