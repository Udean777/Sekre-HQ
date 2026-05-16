package org.sekre_mobile.com.presentation.division

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.foundation.SafeArea

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
                        value = name,
                        onValueChange = { name = it },
                        label = { Text("Nama Divisi *") },
                        placeholder = { Text("Misal: Humas") },
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true,
                        supportingText = {
                            Text(
                                "${trimmed.length}/100",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
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
                    shape = RoundedCornerShape(12.dp),
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
