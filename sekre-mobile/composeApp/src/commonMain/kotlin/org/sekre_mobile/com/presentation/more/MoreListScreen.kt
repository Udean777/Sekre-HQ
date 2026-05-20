package org.sekre_mobile.com.presentation.more

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.ui.graphics.Color
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Logout
import androidx.compose.material.icons.filled.Domain
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import org.sekre_mobile.com.presentation.foundation.SafeArea
import org.sekre_mobile.com.presentation.more.components.MoreMenuItem
import org.sekre_mobile.com.presentation.more.components.MoreSectionCard
import org.sekre_mobile.com.presentation.more.components.ProfileHeaderCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MoreListScreen(
    state: MoreState,
    onOpenProfile: () -> Unit,
    onOpenChangePassword: () -> Unit,
    onOpenDivisions: () -> Unit,
    onOpenMembers: () -> Unit,
    onOpenAddMember: () -> Unit,
    onLogout: () -> Unit,
) {
    var showLogoutDialog by remember { mutableStateOf(false) }
    val canManageMembers = state.authenticatedUser?.hasAdminPrivileges() ?: false

    SafeArea {
        Scaffold(
            topBar = {
                CenterAlignedTopAppBar(
                    title = {
                        Text(
                            "Lainnya",
                            fontWeight = FontWeight.Bold,
                            style = MaterialTheme.typography.titleLarge,
                        )
                    },
                    colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                        containerColor = Color.Transparent,
                    ),
                )
            },
            containerColor = Color.Transparent,
        ) { paddingValues ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(
                    start = 16.dp,
                    end = 16.dp,
                    top = 8.dp,
                    bottom = 32.dp,
                ),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                item {
                    ProfileHeaderCard(
                        user = state.authenticatedUser,
                        profile = state.profile,
                    )
                }

                item {
                    MoreSectionCard(title = "Organisasi") {
                        item {
                            MoreMenuItem(
                                icon = Icons.Default.Domain,
                                label = "Divisi",
                                description = "Kelola divisi organisasi",
                                onClick = onOpenDivisions,
                            )
                        }
                        item {
                            MoreMenuItem(
                                icon = Icons.Default.Group,
                                label = "Anggota",
                                description = "Lihat semua anggota",
                                onClick = onOpenMembers,
                            )
                        }
                        if (canManageMembers) {
                            item {
                                MoreMenuItem(
                                    icon = Icons.Default.PersonAdd,
                                    label = "Tambah Anggota",
                                    description = "Undang anggota baru",
                                    onClick = onOpenAddMember,
                                )
                            }
                        }
                    }
                }

                item {
                    MoreSectionCard(title = "Akun") {
                        item {
                            MoreMenuItem(
                                icon = Icons.Default.Person,
                                label = "Profil Saya",
                                description = "Perbarui nama dan email",
                                onClick = onOpenProfile,
                            )
                        }
                        item {
                            MoreMenuItem(
                                icon = Icons.Default.Lock,
                                label = "Ubah Password",
                                description = "Ganti kata sandi akun",
                                onClick = onOpenChangePassword,
                            )
                        }
                    }
                }

                item {
                    OutlinedButton(
                        onClick = { showLogoutDialog = true },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                            .padding(top = 12.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = SekreTheme.colors.accentDanger,
                        ),
                    ) {
                        Icon(
                            Icons.AutoMirrored.Filled.Logout,
                            contentDescription = null,
                        )
                        Text(
                            text = "Keluar",
                            modifier = Modifier.padding(start = 8.dp),
                            fontWeight = FontWeight.SemiBold,
                        )
                    }
                }

                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 16.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(2.dp),
                        ) {
                            Text(
                                text = "Sekre",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.SemiBold,
                                color = SekreTheme.colors.onGlassSecondary,
                            )
                            Text(
                                text = "v1.0.0",
                                style = MaterialTheme.typography.labelSmall,
                                color = SekreTheme.colors.onGlassSecondary,
                            )
                        }
                    }
                }
            }
        }
    }

    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = {
                Text(
                    text = "Konfirmasi Keluar",
                    fontWeight = FontWeight.Bold,
                )
            },
            text = { Text("Apakah Anda yakin ingin keluar dari sesi ini?") },
            confirmButton = {
                Button(
                    onClick = {
                        showLogoutDialog = false
                        onLogout()
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = SekreTheme.colors.accentDanger,
                    ),
                ) {
                    Text("Keluar")
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutDialog = false }) {
                    Text("Batal")
                }
            },
        )
    }
}
