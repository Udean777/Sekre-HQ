package org.sekre_mobile.com.presentation.finance

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.domain.entity.TransactionStatus
import org.sekre_mobile.com.domain.entity.TransactionType
import org.sekre_mobile.com.presentation.finance.components.TransactionStatusChip
import org.sekre_mobile.com.presentation.foundation.SafeArea
import org.sekre_mobile.com.presentation.foundation.formatCurrency
import org.sekre_mobile.com.presentation.foundation.formatDate

/**
 * Read-only detail view for a transaction. Shows the full record without
 * any input controls. Editing is performed in [FinanceEditScreen] reachable
 * via [onOpenEdit] when the transaction is still editable. Mirrors the
 * pattern used by Division detail/form.
 *
 * Layout uses stacked label/value blocks rather than horizontal SpaceBetween
 * so that long values (description, event title, receipt URL) wrap cleanly
 * instead of pushing each other out of the visible area.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FinanceDetailScreen(
    state: FinanceState,
    onBack: () -> Unit,
    onOpenEdit: (String) -> Unit,
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
        var showDeleteConfirm by remember { mutableStateOf(false) }

        val divisionName = state.divisions.firstOrNull { it.id == tx.divisionId }?.name
        val eventTitle = tx.eventId?.let { eventId ->
            state.divisionEvents.firstOrNull { it.event.id == eventId }?.event?.title
        }

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
            ) {
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    HeaderCard(
                        amountText = formatCurrency(tx.amountCents, tx.currency),
                        amountColor = if (tx.type == TransactionType.INCOME)
                            MaterialTheme.colorScheme.tertiary
                        else
                            MaterialTheme.colorScheme.error,
                        createdAt = formatDate(tx.createdAt),
                        status = tx.status,
                    )

                    InfoCard(
                        items = buildList {
                            add(
                                InfoItem(
                                    "Tipe",
                                    if (tx.type == TransactionType.INCOME) "Pemasukan" else "Pengeluaran",
                                ),
                            )
                            add(InfoItem("Divisi", divisionName ?: tx.divisionId))
                            if (tx.eventId != null) {
                                add(InfoItem("Acara", eventTitle ?: tx.eventId))
                            }
                            add(InfoItem("Mata Uang", tx.currency))
                            add(InfoItem("Deskripsi", tx.description))
                            if (!tx.receiptUrl.isNullOrBlank()) {
                                add(InfoItem("URL Bukti", tx.receiptUrl))
                            }
                        },
                    )

                    if (!canEdit) {
                        val notice = when (tx.status) {
                            TransactionStatus.APPROVED ->
                                "Transaksi sudah disetujui dan tidak bisa diubah lagi."
                            TransactionStatus.REJECTED ->
                                "Transaksi sudah ditolak dan tidak bisa diubah lagi."
                            TransactionStatus.PENDING -> ""
                        }
                        if (notice.isNotEmpty()) {
                            Text(
                                text = notice,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                }

                if (canEdit || canDelete) {
                    Spacer(modifier = Modifier.height(16.dp))
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        if (canEdit) {
                            Button(
                                onClick = { onOpenEdit(tx.id) },
                                modifier = Modifier.fillMaxWidth().height(50.dp),
                                shape = RoundedCornerShape(12.dp),
                            ) {
                                Text("Edit Transaksi", fontWeight = FontWeight.Bold)
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
private fun HeaderCard(
    amountText: String,
    amountColor: androidx.compose.ui.graphics.Color,
    createdAt: String,
    status: TransactionStatus,
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant,
        ),
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
                    text = "Jumlah",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                TransactionStatusChip(status = status)
            }
            Text(
                text = amountText,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = amountColor,
            )
            Text(
                text = "Dibuat $createdAt",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}

private data class InfoItem(val label: String, val value: String)

@Composable
private fun InfoCard(items: List<InfoItem>) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface,
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 8.dp),
        ) {
            items.forEachIndexed { index, item ->
                StackedInfoRow(label = item.label, value = item.value)
                if (index != items.lastIndex) {
                    HorizontalDivider(
                        color = MaterialTheme.colorScheme.outlineVariant,
                    )
                }
            }
        }
    }
}

/**
 * Vertical label/value pair. Avoids horizontal SpaceBetween so long values
 * (event title, description, URL) wrap onto multiple lines instead of
 * crashing into the label or being cut off.
 */
@Composable
private fun StackedInfoRow(label: String, value: String) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
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
