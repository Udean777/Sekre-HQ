package org.sekre_mobile.com.presentation.division

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.ui.graphics.Color
import org.sekre_mobile.com.presentation.ui.glass.GlassCard
import org.sekre_mobile.com.presentation.ui.glass.GlassIntensity
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.foundation.SafeArea

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DivisionDetailScreen(
    state: DivisionState,
    canManage: Boolean,
    onBack: () -> Unit,
    onOpenEdit: (String) -> Unit,
    onEvent: (DivisionEvent) -> Unit,
) {
    var menuExpanded by remember { mutableStateOf(false) }
    var showDeleteDialog by remember { mutableStateOf(false) }
    val division = state.selectedDivision

    SafeArea {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Detail Divisi", fontWeight = FontWeight.SemiBold) },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(
                                Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = "Kembali",
                            )
                        }
                    },
                    actions = {
                        if (canManage && division != null) {
                            IconButton(onClick = { menuExpanded = true }) {
                                Icon(Icons.Default.MoreVert, contentDescription = "Menu")
                            }
                            DropdownMenu(
                                expanded = menuExpanded,
                                onDismissRequest = { menuExpanded = false },
                            ) {
                                DropdownMenuItem(
                                    text = { Text("Edit Divisi") },
                                    onClick = {
                                        menuExpanded = false
                                        onOpenEdit(division.id)
                                    },
                                    leadingIcon = {
                                        Icon(Icons.Default.Edit, contentDescription = null)
                                    },
                                )
                                DropdownMenuItem(
                                    text = {
                                        Text(
                                            "Hapus Divisi",
                                            color = SekreTheme.colors.accentDanger,
                                        )
                                    },
                                    onClick = {
                                        menuExpanded = false
                                        showDeleteDialog = true
                                    },
                                    leadingIcon = {
                                        Icon(
                                            Icons.Default.Delete,
                                            contentDescription = null,
                                            tint = SekreTheme.colors.accentDanger,
                                        )
                                    },
                                )
                            }
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color.Transparent,
                        titleContentColor = SekreTheme.colors.onGlassPrimary,
                        navigationIconContentColor = SekreTheme.colors.onGlassPrimary,
                        actionIconContentColor = SekreTheme.colors.onGlassPrimary,
                    ),
                )
            },
            containerColor = Color.Transparent,
        ) { paddingValues ->
            when {
                state.isLoading && division == null -> {
                    androidx.compose.foundation.layout.Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(paddingValues),
                        contentAlignment = Alignment.Center,
                    ) { CircularProgressIndicator() }
                }

                division == null -> {
                    androidx.compose.foundation.layout.Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(paddingValues),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                        text = state.errorMessage ?: "Detail divisi tidak tersedia",
                                            color = SekreTheme.colors.onGlassSecondary,
                        )
                    }
                }

                else -> {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(paddingValues),
                        contentPadding = PaddingValues(
                            start = 16.dp, end = 16.dp, top = 8.dp, bottom = 32.dp,
                        ),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        item {
                            GlassCard(
                                modifier = Modifier.fillMaxWidth(),
                                intensity = GlassIntensity.Medium,
                            ) {
                                Column(
                                    modifier = Modifier.fillMaxWidth(),
                                    verticalArrangement = Arrangement.spacedBy(8.dp),
                                ) {
                                    Text(
                                        text = "Nama Divisi",
                                        style = MaterialTheme.typography.labelMedium,
                                        color = SekreTheme.colors.onGlassTertiary,
                                    )
                                    Text(
                                        text = division.name,
                                        style = MaterialTheme.typography.headlineSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = SekreTheme.colors.onGlassPrimary,
                                    )
                                    Text(
                                        text = "${state.divisionMembers.size} anggota",
                                        style = MaterialTheme.typography.bodySmall,
                                        color = SekreTheme.colors.onGlassSecondary,
                                    )
                                }
                            }
                        }

                        item {
                            Text(
                                text = "Anggota Divisi",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.SemiBold,
                                color = SekreTheme.colors.onGlassPrimary,
                                modifier = Modifier.padding(top = 4.dp, start = 4.dp),
                            )
                        }

                        if (state.isLoadingDetailMembers && state.divisionMembers.isEmpty()) {
                            item {
                                androidx.compose.foundation.layout.Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 24.dp),
                                    contentAlignment = Alignment.Center,
                                ) {
                                    CircularProgressIndicator(modifier = Modifier.size(32.dp))
                                }
                            }
                        } else if (state.divisionMembers.isEmpty()) {
                            item {
                                Text(
                                    text = "Belum ada anggota di divisi ini.",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = SekreTheme.colors.onGlassSecondary,
                                    modifier = Modifier.padding(start = 4.dp, top = 4.dp),
                                )
                            }
                        } else {
                            items(state.divisionMembers, key = { it.id }) { member ->
                                GlassCard(
                                    modifier = Modifier.fillMaxWidth(),
                                    intensity = GlassIntensity.Medium,
                                ) {
                                    Column(
                                        modifier = Modifier.fillMaxWidth(),
                                        verticalArrangement = Arrangement.spacedBy(2.dp),
                                    ) {
                                        Text(
                                            text = member.fullName,
                                            style = MaterialTheme.typography.titleSmall,
                                            fontWeight = FontWeight.SemiBold,
                                            color = SekreTheme.colors.onGlassPrimary,
                                        )
                                        Text(
                                            text = member.email,
                                            style = MaterialTheme.typography.bodySmall,
                                            color = SekreTheme.colors.onGlassSecondary,
                                        )
                                        Text(
                                            text = "Peran: ${member.divisionRole.name}",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = SekreTheme.colors.accentPrimary,
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (showDeleteDialog && division != null) {
        AlertDialog(
            onDismissRequest = { if (!state.isDeleting) showDeleteDialog = false },
            title = { Text("Hapus Divisi", fontWeight = FontWeight.Bold) },
            text = {
                Text("Yakin ingin menghapus divisi \"${division.name}\"? Tindakan ini tidak dapat dibatalkan.")
            },
            confirmButton = {
                Button(
                    onClick = {
                        showDeleteDialog = false
                        onEvent(DivisionEvent.SubmitDelete(division.id))
                    },
                    enabled = !state.isDeleting,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = SekreTheme.colors.accentDanger,
                        contentColor   = SekreTheme.colors.backdropDeep,
                    ),
                ) { Text(if (state.isDeleting) "Menghapus..." else "Hapus") }
            },
            dismissButton = {
                TextButton(
                    onClick = { showDeleteDialog = false },
                    enabled = !state.isDeleting,
                ) { Text("Batal") }
            },
        )
    }
}
