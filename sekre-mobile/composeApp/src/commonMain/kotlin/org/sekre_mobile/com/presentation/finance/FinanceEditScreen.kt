package org.sekre_mobile.com.presentation.finance

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.finance.components.TransactionTypeSelector
import org.sekre_mobile.com.presentation.foundation.SafeArea
import org.sekre_mobile.com.presentation.foundation.addThousandSeparators
import org.sekre_mobile.com.presentation.foundation.parseRupiahInputToCents
import org.sekre_mobile.com.presentation.ui.glass.glassTextFieldColors
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

/**
 * Edit form for an existing transaction. Lives behind a dedicated route so
 * the detail screen stays read-only by default.
 *
 * Reads the in-memory `state.selectedTransaction`; the caller is responsible
 * for triggering [FinanceEvent.OpenDetail] before navigating here so the
 * selection is populated. If the selection is missing or stale (different
 * id), shows an empty state to keep the UX predictable.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FinanceEditScreen(
    state: FinanceState,
    transactionId: String,
    onBack: () -> Unit,
    onEvent: (FinanceEvent) -> Unit,
) {
    val selected = state.selectedTransaction
    val tx = selected?.transaction?.takeIf { it.id == transactionId }

    SafeArea(applyImePadding = true) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Edit Transaksi", fontWeight = FontWeight.SemiBold) },
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
                    ),
                )
            },
            containerColor = Color.Transparent,
        ) { paddingValues ->
            if (tx == null) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        "Transaksi tidak ditemukan.",
                        color = SekreTheme.colors.onGlassSecondary,
                    )
                }
                return@Scaffold
            }

            if (!tx.canBeEdited()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        "Transaksi ini tidak bisa diubah.",
                        color = SekreTheme.colors.onGlassSecondary,
                    )
                }
                return@Scaffold
            }

            // Form state seeded from the transaction. Keyed on tx.id so a
            // navigation that swaps the selected transaction resets the form.
            var editType by remember(tx.id) { mutableStateOf(tx.type) }
            var editDescription by remember(tx.id) { mutableStateOf(tx.description) }
            var editAmountInput by remember(tx.id) {
                mutableStateOf((tx.amountCents / 100).toString())
            }
            var editReceiptUrl by remember(tx.id) { mutableStateOf(tx.receiptUrl.orEmpty()) }

            val parsedCents = parseRupiahInputToCents(editAmountInput)
            val isValid = editDescription.isNotBlank() && (parsedCents ?: 0L) > 0L

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
                        selected = editType,
                        onSelect = { editType = it },
                    )

                    OutlinedTextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = editAmountInput,
                        onValueChange = { input ->
                            editAmountInput = input.filter { it.isDigit() }
                        },
                        label = { Text("Jumlah (Rp) *") },
                        prefix = { Text("Rp ") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        supportingText = {
                            val rupiah = editAmountInput.toLongOrNull() ?: 0L
                            Text(
                                "Akan disimpan sebagai ${addThousandSeparators(rupiah)}",
                                style = SekreTheme.typography.bodySmall,
                            )
                        },
                        shape = SekreTheme.shapes.medium,
                        colors = glassTextFieldColors(),
                    )

                    OutlinedTextField(
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(min = 100.dp),
                        value = editDescription,
                        onValueChange = { editDescription = it },
                        label = { Text("Deskripsi *") },
                        shape = SekreTheme.shapes.medium,
                        colors = glassTextFieldColors(),
                        maxLines = 5,
                    )

                    OutlinedTextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = editReceiptUrl,
                        onValueChange = { editReceiptUrl = it },
                        label = { Text("URL Bukti (opsional)") },
                        placeholder = { Text("https://...") },
                        shape = SekreTheme.shapes.medium,
                        colors = glassTextFieldColors(),
                    )
                }

                Button(
                    onClick = {
                        val cents = parsedCents ?: return@Button
                        onEvent(
                            FinanceEvent.SubmitEdit(
                                tx.id,
                                type = editType,
                                amountCents = cents,
                                description = editDescription,
                                receiptUrl = editReceiptUrl.ifBlank { null },
                            ),
                        )
                        onBack()
                    },
                    enabled = isValid && !state.isLoading,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = SekreTheme.shapes.medium,
                ) {
                    Text(
                        text = if (state.isLoading) "Menyimpan..." else "Simpan Perubahan",
                        fontWeight = FontWeight.Bold,
                    )
                }
            }
        }
    }
}
