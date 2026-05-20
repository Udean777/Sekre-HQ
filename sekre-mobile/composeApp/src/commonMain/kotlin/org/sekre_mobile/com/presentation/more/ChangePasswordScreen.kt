package org.sekre_mobile.com.presentation.more

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.foundation.SafeArea

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChangePasswordScreen(
    state: MoreState,
    onBack: () -> Unit,
    onEvent: (MoreEvent) -> Unit,
) {
    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var showCurrent by remember { mutableStateOf(false) }
    var showNew by remember { mutableStateOf(false) }
    var showConfirm by remember { mutableStateOf(false) }

    val passwordTooShort = newPassword.isNotBlank() && newPassword.length < 8
    val mismatch = confirmPassword.isNotBlank() && newPassword != confirmPassword
    val canSubmit = !state.isSubmittingPassword
        && currentPassword.isNotBlank()
        && newPassword.length >= 8
        && newPassword == confirmPassword
        && newPassword != currentPassword

    SafeArea(applyImePadding = true) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Ubah Password", fontWeight = FontWeight.SemiBold) },
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
                    PasswordField(
                        value = currentPassword,
                        onValueChange = { currentPassword = it },
                        label = "Password Saat Ini *",
                        visible = showCurrent,
                        onToggleVisibility = { showCurrent = !showCurrent },
                    )

                    PasswordField(
                        value = newPassword,
                        onValueChange = { newPassword = it },
                        label = "Password Baru *",
                        visible = showNew,
                        onToggleVisibility = { showNew = !showNew },
                        isError = passwordTooShort,
                        helperText = "Minimal 8 karakter",
                        errorText = "Password baru minimal 8 karakter",
                    )

                    PasswordField(
                        value = confirmPassword,
                        onValueChange = { confirmPassword = it },
                        label = "Konfirmasi Password Baru *",
                        visible = showConfirm,
                        onToggleVisibility = { showConfirm = !showConfirm },
                        isError = mismatch,
                        errorText = "Password konfirmasi tidak sama",
                    )
                }

                Button(
                    onClick = {
                        onEvent(MoreEvent.SubmitPassword(currentPassword, newPassword))
                    },
                    enabled = canSubmit,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = SekreTheme.shapes.medium,
                ) {
                    Text(
                        text = if (state.isSubmittingPassword) "Menyimpan..." else "Simpan Password",
                        fontWeight = FontWeight.Bold,
                    )
                }
            }
        }
    }
}

@Composable
private fun PasswordField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    visible: Boolean,
    onToggleVisibility: () -> Unit,
    isError: Boolean = false,
    helperText: String? = null,
    errorText: String? = null,
) {
    OutlinedTextField(
        modifier = Modifier.fillMaxWidth(),
        value = value,
        onValueChange = onValueChange,
        label = { Text(label) },
        shape = SekreTheme.shapes.medium,
        singleLine = true,
        isError = isError,
        visualTransformation = if (visible) VisualTransformation.None else PasswordVisualTransformation(),
        trailingIcon = {
            IconButton(onClick = onToggleVisibility) {
                Icon(
                    imageVector = if (visible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                    contentDescription = if (visible) "Sembunyikan" else "Tampilkan",
                    modifier = Modifier.size(20.dp),
                )
            }
        },
        supportingText = {
            when {
                isError && !errorText.isNullOrBlank() -> Text(
                    errorText,
                    style = MaterialTheme.typography.bodySmall,
                    color = SekreTheme.colors.accentDanger,
                )

                !helperText.isNullOrBlank() -> Text(
                    helperText,
                    style = MaterialTheme.typography.bodySmall,
                    color = SekreTheme.colors.onGlassSecondary,
                )
            }
        },
    )
}
