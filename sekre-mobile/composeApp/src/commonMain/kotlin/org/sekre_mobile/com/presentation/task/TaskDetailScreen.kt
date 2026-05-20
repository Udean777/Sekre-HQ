package org.sekre_mobile.com.presentation.task

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
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
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.domain.entity.TaskStatus
import org.sekre_mobile.com.presentation.foundation.SafeArea
import org.sekre_mobile.com.presentation.foundation.formatDate
import org.sekre_mobile.com.presentation.task.components.TaskStatusChip

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TaskDetailScreen(
    state: TaskState,
    onBack: () -> Unit,
    onEvent: (TaskEvent) -> Unit
) {
    val selected = state.selectedTask

    SafeArea(applyImePadding = true) {
        if (selected == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(
                    "Tidak ada tugas yang dipilih",
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            return@SafeArea
        }

        var editTitle by remember(selected.task.id) { mutableStateOf(selected.task.title) }
        var editDescription by remember(selected.task.id) { mutableStateOf(selected.task.description) }
        var editStatus by remember(selected.task.id) { mutableStateOf(selected.task.status) }
        var editAssigneeId by remember(selected.task.id) { mutableStateOf(selected.task.assigneeId) }
        var editAssigneeName by remember(selected.task.id) {
            mutableStateOf(selected.assignee?.fullName.orEmpty())
        }
        var editDueDate by remember(selected.task.id) { mutableStateOf(selected.task.dueDate) }

        var statusDropdownExpanded by remember { mutableStateOf(false) }
        var assigneeDropdownExpanded by remember { mutableStateOf(false) }
        var showDatePicker by remember { mutableStateOf(false) }

        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Detail Tugas", fontWeight = FontWeight.SemiBold) },
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
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Status Terkini",
                            style = MaterialTheme.typography.titleSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        TaskStatusChip(status = selected.task.status)
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))

                    OutlinedTextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = editTitle,
                        onValueChange = { editTitle = it },
                        label = { Text("Judul Tugas *") },
                        shape = RoundedCornerShape(12.dp)
                    )

                    OutlinedTextField(
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(min = 120.dp),
                        value = editDescription,
                        onValueChange = { editDescription = it },
                        label = { Text("Deskripsi") },
                        shape = RoundedCornerShape(12.dp),
                        maxLines = 5
                    )

                    // Status dropdown
                    Box(modifier = Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { statusDropdownExpanded = true },
                            value = editStatus.toLabel(),
                            onValueChange = {},
                            readOnly = true,
                            enabled = false,
                            label = { Text("Status *") },
                            trailingIcon = {
                                Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                            },
                            shape = RoundedCornerShape(12.dp)
                        )
                        DropdownMenu(
                            expanded = statusDropdownExpanded,
                            onDismissRequest = { statusDropdownExpanded = false },
                            modifier = Modifier.fillMaxWidth(0.9f)
                        ) {
                            TaskStatus.entries.forEach { status ->
                                DropdownMenuItem(
                                    text = { Text(status.toLabel()) },
                                    onClick = {
                                        editStatus = status
                                        statusDropdownExpanded = false
                                    }
                                )
                            }
                        }
                    }

                    // Assignee dropdown (members of this task's division)
                    Box(modifier = Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { assigneeDropdownExpanded = true },
                            value = editAssigneeName,
                            onValueChange = {},
                            readOnly = true,
                            enabled = false,
                            label = { Text("Penanggung Jawab (opsional)") },
                            placeholder = {
                                Text(
                                    when {
                                        state.isLoadingMembers -> "Memuat anggota..."
                                        state.divisionMembers.isEmpty() -> "Belum ada anggota"
                                        else -> "Pilih anggota"
                                    }
                                )
                            },
                            trailingIcon = {
                                if (editAssigneeId != null) {
                                    IconButton(onClick = {
                                        editAssigneeId = null
                                        editAssigneeName = ""
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
                                        editAssigneeId = member.id
                                        editAssigneeName = member.fullName
                                        assigneeDropdownExpanded = false
                                    }
                                )
                            }
                        }
                    }

                    OutlinedTextField(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { showDatePicker = true },
                        value = formatDate(editDueDate),
                        onValueChange = {},
                        readOnly = true,
                        enabled = false,
                        label = { Text("Tanggal Jatuh Tempo (opsional)") },
                        placeholder = { Text("Pilih tanggal") },
                        trailingIcon = {
                            if (editDueDate != null) {
                                IconButton(onClick = { editDueDate = null }) {
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

                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    if (selected.task.status != TaskStatus.DONE) {
                        Button(
                            onClick = {
                                onEvent(TaskEvent.SubmitStatus(selected.task.id, TaskStatus.DONE))
                                onBack()
                            },
                            modifier = Modifier.fillMaxWidth().height(50.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = MaterialTheme.colorScheme.tertiary
                            ),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(
                                Icons.Default.CheckCircle,
                                contentDescription = null,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Tandai Selesai", fontWeight = FontWeight.Bold)
                        }
                    }

                    Button(
                        onClick = {
                            onEvent(
                                TaskEvent.SubmitEdit(
                                    id = selected.task.id,
                                    title = editTitle,
                                    status = editStatus,
                                    description = editDescription.ifBlank { null },
                                    assigneeId = editAssigneeId,
                                    dueDate = editDueDate,
                                )
                            )
                            onBack()
                        },
                        enabled = editTitle.isNotBlank(),
                        modifier = Modifier.fillMaxWidth().height(50.dp),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Simpan Perubahan", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        if (showDatePicker) {
            val datePickerState = rememberDatePickerState(initialSelectedDateMillis = editDueDate)
            DatePickerDialog(
                onDismissRequest = { showDatePicker = false },
                confirmButton = {
                    TextButton(onClick = {
                        editDueDate = datePickerState.selectedDateMillis?.let {
                            it + END_OF_DAY_OFFSET_MS
                        }
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
}

private fun TaskStatus.toLabel(): String = when (this) {
    TaskStatus.TODO -> "To Do"
    TaskStatus.IN_PROGRESS -> "In Progress"
    TaskStatus.DONE -> "Done"
}
