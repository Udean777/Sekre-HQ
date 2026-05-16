package org.sekre_mobile.com.presentation.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.presentation.auth.components.AuthFooter
import org.sekre_mobile.com.presentation.auth.components.AuthHeader
import org.sekre_mobile.com.presentation.auth.components.AuthPasswordTextField
import org.sekre_mobile.com.presentation.auth.components.AuthTextField
import org.sekre_mobile.com.presentation.foundation.SafeArea

@Composable
fun LoginScreen(
    state: AuthState,
    onEvent: (AuthEvent) -> Unit,
    onNavigateToRegister: () -> Unit
) {
    SafeArea(applyImePadding = true) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(
                modifier = Modifier.widthIn(max = 450.dp),
                verticalArrangement = Arrangement.spacedBy(32.dp)
            ) {
                AuthHeader(
                    title = "Selamat Datang",
                    subtitle = "Silakan masuk ke akun organisasi Anda untuk melanjutkan pemantauan."
                )

                Column(
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    AuthTextField(
                        value = state.email,
                        onValueChange = { onEvent(AuthEvent.EmailChanged(it)) },
                        label = "Email Organisasi",
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                    )

                    AuthPasswordTextField(
                        value = state.password,
                        onValueChange = { onEvent(AuthEvent.PasswordChanged(it)) },
                        label = "Kata Sandi"
                    )

                    state.errorMessage?.let { msg ->
                        Text(
                            text = msg,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }

            AuthFooter(
                actionButtonText = "Masuk",
                onActionClick = { onEvent(AuthEvent.SubmitLogin) },
                switchModeText = "Belum punya akun?",
                switchModeActionText = "Daftar",
                onSwitchModeClick = onNavigateToRegister,
                isLoading = state.isLoading,
                modifier = Modifier.widthIn(max = 450.dp).padding(top = 24.dp)
            )
        }
    }
}

@Composable
fun RegisterScreen(
    state: AuthState,
    onEvent: (AuthEvent) -> Unit,
    onNavigateToLogin: () -> Unit
) {
    SafeArea(applyImePadding = true) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(
                modifier = Modifier.widthIn(max = 450.dp),
                verticalArrangement = Arrangement.spacedBy(32.dp)
            ) {
                AuthHeader(
                    title = "Buat Akun",
                    subtitle = "Daftarkan organisasi Anda untuk memulai manajemen administrasi yang rapi."
                )

                // Input Fields Section
                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    AuthTextField(
                        value = state.fullName,
                        onValueChange = { onEvent(AuthEvent.FullNameChanged(it)) },
                        label = "Nama Lengkap"
                    )

                    AuthTextField(
                        value = state.email,
                        onValueChange = { onEvent(AuthEvent.EmailChanged(it)) },
                        label = "Email",
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
                    )

                    AuthPasswordTextField(
                        value = state.password,
                        onValueChange = { onEvent(AuthEvent.PasswordChanged(it)) },
                        label = "Kata Sandi"
                    )

                    state.errorMessage?.let { msg ->
                        Text(
                            text = msg,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }

            AuthFooter(
                actionButtonText = "Daftar",
                onActionClick = { onEvent(AuthEvent.SubmitRegister) },
                switchModeText = "Sudah memiliki akun?",
                switchModeActionText = "Masuk",
                onSwitchModeClick = onNavigateToLogin,
                isLoading = state.isLoading,
                modifier = Modifier.widthIn(max = 450.dp).padding(top = 24.dp)
            )
        }
    }
}
