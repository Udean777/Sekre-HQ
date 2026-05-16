package org.sekre_mobile.com.presentation.finance

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
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.Close
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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.domain.entity.TransactionType
import org.sekre_mobile.com.presentation.finance.components.TransactionTypeSelector
import org.sekre_mobile.com.presentation.foundation.SafeArea
import org.sekre_mobile.com.presentation.foundation.addThousandSeparators
import org.sekre_mobile.com.presentation.foundation.parseRupiahInputToCents

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FinanceCreateScreen(
    state: FinanceState,
    onBack: () -> Unit,
    onEvent: (FinanceEvent) -> Unit,
) {
    var type by remember { mutableStateOf(TransactionType.EXPENSE) }
    var selectedDivisionId by remember { mutableStateOf("") }
    var selectedDivisionName by remember { mutableStateOf("") }
    var selectedEventId by remember { mutableStateOf<String?>(null) }
    var selectedEventTitle by remember { mutableStateOf("") }
    var amountInput by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var receiptUrl by remember { mutableStateOf("") }

    var divisionDropdownExpanded by remember { mutableStateOf(false) }
    var eventDropdownExpanded by remember { mutableStateOf(false) }

    LaunchedEffect(selectedDivisionId) {
        if (selectedDivisionId.isNotBlank()) {
            onEvent(FinanceEvent.LoadDivisionEvents(selectedDivisionId))
            selectedEventId = null
            selectedEventTitle = ""
        }
    }

    val parsedCents = parseRupiahInputToCents(amountInput)
    val canSubmit = selectedDivisionId.isNotBlank()
        && description.isNotBlank()
        && (parsedCents ?: 0L) > 0L

    SafeArea(applyImePadding = true) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Catat Transaksi", fontWeight = FontWeight.SemiBold) },
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
                    TransactionTypeSelector(
                        selected = type,
                        onSelect = { type = it },
                    )

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

                    // Event dropdown (optional, depends on division)
                    Box(modifier = Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable(enabled = selectedDivisionId.isNotBlank()) {
                                    eventDropdownExpanded = true
                                },
                            value = selectedEventTitle,
                            onValueChange = {},
                            readOnly = true,
                            enabled = false,
                            label = { Text("Acara Terkait (opsional)") },
                            placeholder = {
                                Text(
                                    when {
                                        selectedDivisionId.isBlank() -> "Pilih divisi dulu"
                                        state.isLoadingDivisionEvents -> "Memuat acara..."
                                        state.divisionEvents.isEmpty() -> "Belum ada acara"
                                        else -> "Pilih acara"
                                    },
                                )
                            },
                            trailingIcon = {
                                if (selectedEventId != null) {
                                    IconButton(onClick = {
                                        selectedEventId = null
                                        selectedEventTitle = ""
                                    }) {
                                        Icon(Icons.Default.Close, contentDescription = "Hapus")
                                    }
                                } else {
                                    Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                                }
                            },
                            shape = RoundedCornerShape(12.dp),
                        )
                        DropdownMenu(
                            expanded = eventDropdownExpanded,
                            onDismissRequest = { eventDropdownExpanded = false },
                            modifier = Modifier.fillMaxWidth(0.9f),
                        ) {
                            state.divisionEvents.forEach { item ->
                                DropdownMenuItem(
                                    text = { Text(item.event.title) },
                                    onClick = {
                                        selectedEventId = item.event.id
                                        selectedEventTitle = item.event.title
                                        eventDropdownExpanded = false
                                    },
                                )
                            }
                        }
                    }

                    OutlinedTextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = amountInput,
                        onValueChange = { input -> amountInput = input.filter { it.isDigit() } },
                        label = { Text("Jumlah (Rp) *") },
                        prefix = { Text("Rp ") },
                        placeholder = { Text("0") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        supportingText = {
                            val rupiah = amountInput.toLongOrNull() ?: 0L
                            Text(
                                "Akan disimpan sebagai Rp ${addThousandSeparators(rupiah)}",
                                style = MaterialTheme.typography.bodySmall,
                            )
                        },
                        shape = RoundedCornerShape(12.dp),
                    )

                    OutlinedTextField(
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(min = 100.dp),
                        value = description,
                        onValueChange = { description = it },
                        label = { Text("Deskripsi *") },
                        shape = RoundedCornerShape(12.dp),
                        maxLines = 5,
                    )

                    OutlinedTextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = receiptUrl,
                        onValueChange = { receiptUrl = it },
                        label = { Text("URL Bukti (opsional)") },
                        placeholder = { Text("https://...") },
                        shape = RoundedCornerShape(12.dp),
                    )
                }

                Button(
                    onClick = {
                        val cents = parsedCents ?: return@Button
                        onEvent(
                            FinanceEvent.SubmitCreate(
                                divisionId = selectedDivisionId,
                                eventId = selectedEventId,
                                type = type,
                                amountCents = cents,
                                description = description,
                                receiptUrl = receiptUrl.ifBlank { null },
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
                    Text("Simpan Transaksi", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
