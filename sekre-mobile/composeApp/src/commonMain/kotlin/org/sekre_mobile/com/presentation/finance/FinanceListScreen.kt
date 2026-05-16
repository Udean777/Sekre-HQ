package org.sekre_mobile.com.presentation.finance

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.finance.components.EmptyTransactionState
import org.sekre_mobile.com.presentation.finance.components.FinanceSummaryCard
import org.sekre_mobile.com.presentation.finance.components.TransactionItemCard
import org.sekre_mobile.com.presentation.foundation.SafeArea

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FinanceListScreen(
    state: FinanceState,
    onOpenCreate: () -> Unit,
    onOpenDetail: (String) -> Unit,
    onEvent: (FinanceEvent) -> Unit,
) {
    SafeArea {
        Scaffold(
            topBar = {
                CenterAlignedTopAppBar(
                    title = {
                        Text(
                            "Keuangan",
                            fontWeight = FontWeight.Bold,
                            style = MaterialTheme.typography.titleLarge,
                        )
                    },
                    actions = {
                        IconButton(onClick = { onEvent(FinanceEvent.Load) }) {
                            Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.background,
                    ),
                )
            },
            floatingActionButton = {
                FloatingActionButton(
                    onClick = onOpenCreate,
                    containerColor = MaterialTheme.colorScheme.primary,
                    contentColor = MaterialTheme.colorScheme.onPrimary,
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Catat Transaksi")
                }
            },
            containerColor = MaterialTheme.colorScheme.background,
        ) { paddingValues ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
            ) {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(
                        start = 16.dp, end = 16.dp, top = 8.dp, bottom = 88.dp,
                    ),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    item {
                        FinanceSummaryCard(summary = state.summary)
                    }

                    item {
                        Text(
                            text = "Transaksi Terbaru",
                            style = MaterialTheme.typography.titleSmall,
                            fontWeight = FontWeight.SemiBold,
                            color = MaterialTheme.colorScheme.onSurface,
                            modifier = Modifier.padding(top = 4.dp, start = 4.dp),
                        )
                    }

                    when {
                        state.isLoading && state.transactions.isEmpty() -> {
                            item {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 48.dp),
                                    contentAlignment = Alignment.Center,
                                ) { CircularProgressIndicator() }
                            }
                        }

                        !state.isLoading && state.transactions.isEmpty() -> {
                            item {
                                EmptyTransactionState(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(top = 32.dp),
                                )
                            }
                        }

                        else -> {
                            items(state.transactions, key = { it.transaction.id }) { item ->
                                TransactionItemCard(
                                    item = item,
                                    onClick = { onOpenDetail(item.transaction.id) },
                                )
                            }

                            if (state.hasMore) {
                                item {
                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 16.dp),
                                        contentAlignment = Alignment.Center,
                                    ) {
                                        if (state.isLoadingMore) {
                                            CircularProgressIndicator(
                                                modifier = Modifier.size(32.dp),
                                            )
                                        } else {
                                            TextButton(onClick = { onEvent(FinanceEvent.LoadNextPage) }) {
                                                Text("Muat lebih banyak")
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
