package org.sekre_mobile.com.presentation.division

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.foundation.SafeArea
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DivisionFormScreen(
    state: DivisionState,
    divisionId: String?,
    onBack: () -> Unit,
    onEvent: (DivisionEvent) -> Unit,
) {
    val isEdit = divisionId != null
    val initialName = if (isEdit) state.selectedDivision?.name.orEmpty() else ""
    var name by remember(initialName) { mutableStateOf(initialName) }

    val trimmed = name.trim()
    val canSubmit = !state.isSubmitting
        && trimmed.isNotBlank()
        && trimmed.length <= 100
        && (!isEdit || trimmed != state.selectedDivision?.name)

    SafeArea(applyImePadding = true) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            if (isEdit) "Edit Divisi" else "Buat Divisi",
                            fontWeight = FontWeight.SemiBold,
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
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color.Transparent,
                        titleContentColor = SekreTheme.colors.onGlassPrimary,
                        navigationIconContentColor = SekreTheme.colors.onGlassPrimary,
                    ),
                )
            },
            containerColor = Color.Transparent,
        ) { paddingValues ->
            val colors = SekreTheme.colors
            val spacing = SekreTheme.spacing

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = spacing.xl, vertical = spacing.lg),
                verticalArrangement = Arrangement.SpaceBetween,
            ) {
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(spacing.lg),
                ) {
                    OutlinedTextField(
                        modifier = Modifier.fillMaxWidth(),
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Nama Divisi *") },
                        placeholder = { Text("Misal: Humas") },
                        shape = SekreTheme.shapes.medium,
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor   = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent,
                            focusedTextColor        = colors.onGlassPrimary,
                            unfocusedTextColor      = colors.onGlassPrimary,
                            focusedLabelColor       = colors.accentPrimary,
                            unfocusedLabelColor     = colors.onGlassTertiary,
                            focusedBorderColor      = colors.accentPrimary,
                            unfocusedBorderColor    = colors.glassBorder,
                            cursorColor             = colors.accentPrimary,
                            focusedSupportingTextColor   = colors.onGlassSecondary,
                            unfocusedSupportingTextColor = colors.onGlassSecondary,
                        ),
                        supportingText = {
                            Text(
                                "${trimmed.length}/100",
                                style = MaterialTheme.typography.bodySmall,
                            )
                        },
                    )
                }

                Button(
                    onClick = {
                        if (isEdit && divisionId != null) {
                            onEvent(DivisionEvent.SubmitEdit(divisionId, trimmed))
                        } else {
                            onEvent(DivisionEvent.SubmitCreate(trimmed))
                        }
                    },
                    enabled = canSubmit,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = SekreTheme.shapes.medium,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colors.accentPrimary,
                        contentColor   = colors.backdropDeep,
                        disabledContainerColor = colors.accentPrimary.copy(alpha = 0.38f),
                        disabledContentColor   = colors.backdropDeep.copy(alpha = 0.38f),
                    ),
                ) {
                    Text(
                        text = when {
                            state.isSubmitting -> "Menyimpan..."
                            isEdit -> "Simpan Perubahan"
                            else -> "Simpan Divisi"
                        },
                        fontWeight = FontWeight.Bold,
                    )
                }
            }
        }
    }
}
