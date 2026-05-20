package org.sekre_mobile.com.presentation.member

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.foundation.SafeArea
import org.sekre_mobile.com.presentation.member.components.EmptyMemberState
import org.sekre_mobile.com.presentation.member.components.MemberItemCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MemberListScreen(
    state: MemberState,
    canAdd: Boolean,
    onBack: () -> Unit,
    onOpenAddMember: () -> Unit,
    onEvent: (MemberEvent) -> Unit,
) {
    SafeArea {
        Scaffold(
            topBar = {
                CenterAlignedTopAppBar(
                    title = {
                        Text(
                            "Anggota",
                            fontWeight = FontWeight.Bold,
                            style = MaterialTheme.typography.titleLarge,
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(
                                Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Kembali",
                            )
                        }
                    },
                    actions = {
                        IconButton(onClick = { onEvent(MemberEvent.Load) }) {
                            Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.background,
                    ),
                )
            },
            floatingActionButton = {
                if (canAdd) {
                    FloatingActionButton(
                        onClick = onOpenAddMember,
                        containerColor = MaterialTheme.colorScheme.primary,
                        contentColor = MaterialTheme.colorScheme.onPrimary,
                    ) {
                        Icon(Icons.Default.PersonAdd, contentDescription = "Tambah Anggota")
                    }
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
                    if (state.divisions.isNotEmpty()) {
                        item {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .horizontalScroll(rememberScrollState()),
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                            ) {
                                FilterChip(
                                    selected = state.selectedDivisionFilter == null,
                                    onClick = {
                                        onEvent(MemberEvent.FilterByDivision(null))
                                    },
                                    label = { Text("Semua") },
                                    colors = FilterChipDefaults.filterChipColors(),
                                )
                                state.divisions.forEach { division ->
                                    FilterChip(
                                        selected = state.selectedDivisionFilter == division.id,
                                        onClick = {
                                            onEvent(
                                                MemberEvent.FilterByDivision(division.id),
                                            )
                                        },
                                        label = { Text(division.name) },
                                        colors = FilterChipDefaults.filterChipColors(),
                                    )
                                }
                            }
                        }
                    }

                    when {
                        state.isLoading && state.members.isEmpty() -> {
                            item {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 48.dp),
                                    contentAlignment = Alignment.Center,
                                ) { CircularProgressIndicator() }
                            }
                        }

                        !state.isLoading && state.members.isEmpty() -> {
                            item {
                                EmptyMemberState(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(top = 32.dp),
                                    title = if (state.selectedDivisionFilter != null) {
                                        "Belum ada anggota di divisi ini"
                                    } else {
                                        "Belum ada anggota"
                                    },
                                    description = if (state.selectedDivisionFilter != null) {
                                        "Pilih divisi lain atau tambahkan anggota baru."
                                    } else {
                                        "Tambah anggota agar mereka bisa berkolaborasi."
                                    },
                                )
                            }
                        }

                        else -> {
                            items(state.members, key = { it.id }) { member ->
                                MemberItemCard(member = member)
                            }
                        }
                    }
                }
            }
        }
    }
}
