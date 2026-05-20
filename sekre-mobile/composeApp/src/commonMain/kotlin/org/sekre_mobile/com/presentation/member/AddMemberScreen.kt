package org.sekre_mobile.com.presentation.member

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
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
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.domain.entity.UserRole
import org.sekre_mobile.com.presentation.foundation.SafeArea
import org.sekre_mobile.com.presentation.ui.glass.glassTextFieldColors
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddMemberScreen(
    state: AddMemberState,
    onBack: () -> Unit,
    onEvent: (AddMemberEvent) -> Unit,
) {
    var roleDropdownExpanded by remember { mutableStateOf(false) }

    val emailValid = state.email.isBlank() || (state.email.contains("@") && state.email.contains("."))
    val canSubmit = !state.isLoading
        && state.fullName.isNotBlank()
        && state.email.isNotBlank()
        && emailValid
        && state.role.isNotBlank()

    SafeArea(applyImePadding = true) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Tambah Anggota", fontWeight = FontWeight.SemiBold) },
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
                    OutlinedTextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = state.fullName,
                        onValueChange = { onEvent(AddMemberEvent.SetFullName(it)) },
                        label = { Text("Nama Lengkap *") },
                        shape = SekreTheme.shapes.medium,
                        colors = glassTextFieldColors(),
                        singleLine = true,
                    )

                    OutlinedTextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = state.email,
                        onValueChange = { onEvent(AddMemberEvent.SetEmail(it)) },
                        label = { Text("Email *") },
                        shape = SekreTheme.shapes.medium,
                        colors = glassTextFieldColors(),
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        isError = !emailValid,
                        supportingText = {
                            if (!emailValid) {
                                Text(
                                    "Format email tidak valid",
                                    style = SekreTheme.typography.bodySmall,
                                    color = SekreTheme.colors.accentDanger,
                                )
                            }
                        },
                    )

                    Box(modifier = Modifier.fillMaxWidth()) {
                        OutlinedTextField(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { roleDropdownExpanded = true },
                            value = state.role,
                            onValueChange = {},
                            readOnly = true,
                            enabled = false,
                            label = { Text("Peran *") },
                            placeholder = { Text("Pilih peran") },
                            trailingIcon = {
                                Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                            },
                            shape = SekreTheme.shapes.medium,
                            colors = glassTextFieldColors(),
                        )
                        DropdownMenu(
                            expanded = roleDropdownExpanded,
                            onDismissRequest = { roleDropdownExpanded = false },
                            modifier = Modifier.fillMaxWidth(0.9f),
                        ) {
                            UserRole.values().forEach { role ->
                                DropdownMenuItem(
                                    text = { Text(role.name) },
                                    onClick = {
                                        onEvent(AddMemberEvent.SetRole(role.name))
                                        roleDropdownExpanded = false
                                    },
                                )
                            }
                        }
                    }

                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            text = "Divisi",
                            style = SekreTheme.typography.labelLarge,
                            fontWeight = FontWeight.SemiBold,
                            color = SekreTheme.colors.onGlassPrimary,
                        )
                        if (state.availableDivisions.isEmpty()) {
                            Text(
                                text = "Belum ada divisi. Buat divisi terlebih dahulu.",
                                style = SekreTheme.typography.bodySmall,
                                color = SekreTheme.colors.onGlassSecondary,
                            )
                        } else {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .horizontalScroll(rememberScrollState()),
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                            ) {
                                state.availableDivisions.forEach { division ->
                                    FilterChip(
                                        selected = state.selectedDivisionIds.contains(division.id),
                                        onClick = {
                                            onEvent(
                                                AddMemberEvent.ToggleDivision(division.id),
                                            )
                                        },
                                        label = { Text(division.name) },
                                        colors = FilterChipDefaults.filterChipColors(),
                                    )
                                }
                            }
                            Text(
                                text = "${state.selectedDivisionIds.size} divisi dipilih",
                                style = SekreTheme.typography.bodySmall,
                                color = SekreTheme.colors.onGlassSecondary,
                            )
                        }
                    }
                }

                Button(
                    onClick = { onEvent(AddMemberEvent.Submit) },
                    enabled = canSubmit,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = SekreTheme.shapes.medium,
                ) {
                    Text(
                        text = if (state.isLoading) "Menambahkan..." else "Tambahkan Anggota",
                        fontWeight = FontWeight.Bold,
                    )
                }
            }
        }
    }
}
