package org.sekre_mobile.com.presentation.finance

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.domain.entity.TransactionType

@Composable
fun FinanceListScreen(
    state: FinanceState,
    onOpenCreate: () -> Unit,
    onOpenDetail: (String) -> Unit,
    onEvent: (FinanceEvent) -> Unit
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Text("Finance")
        val summary = state.summary
        if (summary != null) {
            Text("Income: ${summary.totalIncomeCents} ${summary.currency}")
            Text("Expense: ${summary.totalExpenseCents} ${summary.currency}")
            Text("Balance: ${summary.balanceCents} ${summary.currency}")
        }
        Button(onClick = { onEvent(FinanceEvent.Load) }) { Text("Refresh") }
        Button(onClick = onOpenCreate) { Text("Create") }
        if (state.isLoading) CircularProgressIndicator()
        if (state.transactions.isEmpty() && !state.isLoading) Text("No transactions")
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(state.transactions, key = { it.transaction.id }) { item ->
                Column(
                    modifier = Modifier.fillMaxWidth()
                        .clickable { onOpenDetail(item.transaction.id) }.padding(8.dp)
                ) {
                    Text(item.transaction.description)
                    Text("${item.transaction.type} ${item.transaction.amountCents} ${item.transaction.currency}")
                }
            }
        }
    }
}

@Composable
fun FinanceCreateScreen(onBack: () -> Unit, onEvent: (FinanceEvent) -> Unit) {
    val divisionId = remember { mutableStateOf("") }
    val description = remember { mutableStateOf("") }
    val amountCents = remember { mutableStateOf("") }
    val currency = remember { mutableStateOf("IDR") }
    val type = remember { mutableStateOf("EXPENSE") }
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Text("Create Transaction")
        OutlinedTextField(
            value = divisionId.value,
            onValueChange = { divisionId.value = it },
            label = { Text("Division ID") })
        OutlinedTextField(
            value = description.value,
            onValueChange = { description.value = it },
            label = { Text("Description") })
        OutlinedTextField(
            value = amountCents.value,
            onValueChange = { amountCents.value = it },
            label = { Text("Amount (cents)") })
        OutlinedTextField(
            value = currency.value,
            onValueChange = { currency.value = it },
            label = { Text("Currency") })
        OutlinedTextField(
            value = type.value,
            onValueChange = { type.value = it },
            label = { Text("Type (INCOME/EXPENSE)") })
        Button(onClick = {
            onEvent(
                FinanceEvent.SubmitCreate(
                    divisionId = divisionId.value,
                    eventId = null,
                    type = if (type.value.uppercase() == "INCOME") TransactionType.INCOME else TransactionType.EXPENSE,
                    amountCents = amountCents.value.toLongOrNull() ?: 0L,
                    currency = currency.value,
                    description = description.value,
                    receiptUrl = null,
                ),
            )
            onBack()
        }) { Text("Submit") }
    }
}

@Composable
fun FinanceDetailScreen(state: FinanceState, onBack: () -> Unit, onEvent: (FinanceEvent) -> Unit) {
    val selected = state.selectedTransaction
    if (selected == null) {
        Column(modifier = Modifier.fillMaxSize().padding(16.dp)) { Text("No transaction selected") }
        return
    }
    val description =
        remember(selected.transaction.id) { mutableStateOf(selected.transaction.description) }
    val amountCents =
        remember(selected.transaction.id) { mutableStateOf(selected.transaction.amountCents.toString()) }
    val currency =
        remember(selected.transaction.id) { mutableStateOf(selected.transaction.currency) }
    val type = remember(selected.transaction.id) { mutableStateOf(selected.transaction.type.name) }
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Text("Transaction Detail")
        OutlinedTextField(
            value = description.value,
            onValueChange = { description.value = it },
            label = { Text("Description") })
        OutlinedTextField(
            value = amountCents.value,
            onValueChange = { amountCents.value = it },
            label = { Text("Amount (cents)") })
        OutlinedTextField(
            value = currency.value,
            onValueChange = { currency.value = it },
            label = { Text("Currency") })
        OutlinedTextField(
            value = type.value,
            onValueChange = { type.value = it },
            label = { Text("Type (INCOME/EXPENSE)") })
        Button(onClick = {
            onEvent(
                FinanceEvent.SubmitEdit(
                    selected.transaction.id,
                    if (type.value.uppercase() == "INCOME") TransactionType.INCOME else TransactionType.EXPENSE,
                    amountCents.value.toLongOrNull(),
                    currency.value,
                    description.value,
                    null
                )
            )
        }) { Text("Save") }
        Button(onClick = {
            onEvent(FinanceEvent.SubmitDelete(selected.transaction.id))
            onBack()
        }) { Text("Delete") }
    }
}
