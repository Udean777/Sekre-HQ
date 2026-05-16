package org.sekre_mobile.com.presentation.finance

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
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.domain.entity.TransactionStatus
import org.sekre_mobile.com.domain.entity.TransactionType
import org.sekre_mobile.com.presentation.finance.components.TransactionStatusChip
import org.sekre_mobile.com.presentation.finance.components.TransactionTypeSelector
import org.sekre_mobile.com.presentation.foundation.SafeArea
import org.sekre_mobile.com.presentation.foundation.addThousandSeparators
import org.sekre_mobile.com.presentation.foundation.formatCurrency
import org.sekre_mobile.com.presentation.foundation.formatDate
import org.sekre_mobile.com.presentation.foundation.parseRupiahInputToCents

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FinanceDetailScreen(
    state: FinanceState,
    onBack: () -> Unit,
    onEvent: (FinanceEvent) -> Unit,
) {
    val selected = state.selectedTransaction

    SafeArea(applyImePadding = true) {
        if (selected == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(
                    "Tidak ada transaksi yang dipilih",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            return@SafeArea
        }

        val tx = selected.transaction
        val canEdit = tx.canBeEdited()
        val canDelete = tx.canBeDeleted()

        var editType by remember(tx.id) { mutableStateOf(tx.type) }
        var editDescription by remember(tx.id) { mutableStateOf(tx.description) }
        var editAmountInput by remember(tx.id) { mutableStateOf((tx.amountCents / 100).toString()) }
        var editReceiptUrl by remember(tx.id) { mutableStateOf(tx.receiptUrl.orEmpty()) }
        var showDeleteConfirm by remember { mutableStateOf(false) }

        val parsedCents = parseRupiahInputToCents(editAmountInput)
        val isValid = editDescription.isNotBlank() && (parsedCents ?: 0L) > 0L

        val divisionName = state.divisions.firstOrNull { it.id == tx.divisionId }?.name

        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Detail Transaksi", fontWeight = FontWeight.SemiBold) },
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
                    // Header — status & meta
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Column {
                            Text(
                                text = formatCurrency(tx.amountCents, tx.currency),
                                style = MaterialTheme.typography.headlineSmall,
                                fontWeight = FontWeight.Bold,
                                color = if (tx.type == TransactionType.INCOME) {
                                    MaterialTheme.colorScheme.tertiary
                                } else {
                                    MaterialTheme.colorScheme.error
                                },
                            )
                            Text(
                                text = formatDate(tx.createdAt),
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                        TransactionStatusChip(status = tx.status)
                    }

                    HorizontalDivider()

                    // Read-only meta block
                    InfoRow(label = "Divisi", value = divisionName ?: tx.divisionId)
                    if (tx.eventId != null) {
                        val eventTitle = state.divisionEvents
                            .firstOrNull { it.event.id == tx.eventId }
                            ?.event?.title
                        InfoRow(label = "Acara", value = eventTitle ?: tx.eventId)
                    }
                    InfoRow(label = "Mata Uang", value = tx.currency)

                    HorizontalDivider()

                    if (!canEdit) {
                        Text(
                            text = when (tx.status) {
                                TransactionStatus.APPROVED ->
                                    "Transaksi sudah disetujui dan tidak bisa diedit lagi."
                                TransactionStatus.REJECTED ->
                                    "Transaksi sudah ditolak dan tidak bisa diedit lagi."
                                TransactionStatus.PENDING -> ""
                            },
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }

                    TransactionTypeSelector(
                        selected = editType,
                        onSelect = { if (canEdit) editType = it },
                    )

                    OutlinedTextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = editAmountInput,
                        onValueChange = { input ->
                            if (canEdit) editAmountInput = input.filter { it.isDigit() }
                        },
                        readOnly = !canEdit,
                        label = { Text("Jumlah (Rp) *") },
                        prefix = { Text("Rp ") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        supportingText = {
                            val rupiah = editAmountInput.toLongOrNull() ?: 0L
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
                        value = editDescription,
                        onValueChange = { if (canEdit) editDescription = it },
                        readOnly = !canEdit,
                        label = { Text("Deskripsi *") },
                        shape = RoundedCornerShape(12.dp),
                        maxLines = 5,
                    )

                    OutlinedTextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = editReceiptUrl,
                        onValueChange = { if (canEdit) editReceiptUrl = it },
                        readOnly = !canEdit,
                        label = { Text("URL Bukti (opsional)") },
                        placeholder = { Text("https://...") },
                        shape = RoundedCornerShape(12.dp),
                    )
                }

                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    if (canEdit) {
                        Button(
                            onClick = {
                                val cents = parsedCents ?: return@Button
                                onEvent(
                                    FinanceEvent.SubmitEdit(
                                        id = tx.id,
                                        type = editType,
                                        amountCents = cents,
                                        description = editDescription,
                                        receiptUrl = editReceiptUrl.ifBlank { null },
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
                            Text("Hapus Transaksi", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        if (showDeleteConfirm) {
            AlertDialog(
                onDismissRequest = { showDeleteConfirm = false },
                title = { Text("Hapus transaksi?") },
                text = { Text("Transaksi \"${tx.description}\" akan dihapus secara permanen. Lanjutkan?") },
                confirmButton = {
                    TextButton(onClick = {
                        showDeleteConfirm = false
                        onEvent(FinanceEvent.SubmitDelete(tx.id))
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

@Composable
private fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onSurface,
        )
    }
}
