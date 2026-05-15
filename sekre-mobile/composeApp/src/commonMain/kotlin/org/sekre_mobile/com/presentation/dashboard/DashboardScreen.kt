package org.sekre_mobile.com.presentation.dashboard

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

private fun formatMoney(cents: Long, currency: String): String = "$currency ${cents / 100}"

@Composable
fun DashboardScreen(
    state: DashboardState,
    onEvent: (DashboardEvent) -> Unit,
) {
    when {
        state.isLoading -> {
            Column(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.Center) {
                CircularProgressIndicator()
            }
        }

        state.errorMessage != null && state.user == null && state.financeSummary == null -> {
            Column(
                modifier = Modifier.fillMaxSize().padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Text("Dashboard gagal dimuat")
                Text(state.errorMessage)
                Button(onClick = { onEvent(DashboardEvent.Retry) }) { Text("Coba lagi") }
            }
        }

        else -> {
            Column(
                modifier = Modifier.fillMaxSize().padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Text("Dashboard")
                state.user?.let { user ->
                    Card(modifier = Modifier.fillMaxWidth()) {
                        Column(
                            modifier = Modifier.padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text("Halo, ${user.user.fullName}")
                            Text("Role: ${user.role}")
                            Text("Org: ${user.organization.name}")
                        }
                    }
                }
                state.financeSummary?.let { summary ->
                    Card(modifier = Modifier.fillMaxWidth()) {
                        Column(
                            modifier = Modifier.padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text("Ringkasan Keuangan")
                            Text("Income: ${formatMoney(summary.totalIncomeCents, summary.currency)}")
                            Text("Expense: ${formatMoney(summary.totalExpenseCents, summary.currency)}")
                            Text("Balance: ${formatMoney(summary.balanceCents, summary.currency)}")
                            Text("Transactions: ${summary.transactionCount}")
                        }
                    }
                }
                if (state.errorMessage != null) {
                    Text("Partial error: ${state.errorMessage}")
                    Button(onClick = { onEvent(DashboardEvent.Retry) }) { Text("Retry") }
                }
            }
        }
    }
}
