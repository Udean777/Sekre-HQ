package org.sekre_mobile.com.presentation.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import org.sekre_mobile.com.domain.util.AuthValidators
import org.sekre_mobile.com.presentation.auth.components.AuthFooter
import org.sekre_mobile.com.presentation.auth.components.AuthHeader
import org.sekre_mobile.com.presentation.auth.components.AuthPasswordTextField
import org.sekre_mobile.com.presentation.auth.components.AuthTextField
import org.sekre_mobile.com.presentation.auth.components.sanitizeSubdomainInput
import org.sekre_mobile.com.presentation.foundation.SafeArea
import org.sekre_mobile.com.presentation.ui.glass.GlassIntensity
import org.sekre_mobile.com.presentation.ui.glass.GlassPanel
import org.sekre_mobile.com.presentation.ui.theme.SekreTheme

@Composable
fun LoginScreen(
    state: AuthState,
    onEvent: (AuthEvent) -> Unit,
    onNavigateToRegister: () -> Unit
) {
    val colors = SekreTheme.colors
    val spacing = SekreTheme.spacing

    SafeArea(applyImePadding = true) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = spacing.lg, vertical = spacing.xxl),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(
                modifier = Modifier.widthIn(max = 450.dp),
                verticalArrangement = Arrangement.spacedBy(spacing.xxl)
            ) {
                AuthHeader(
                    title = "Selamat Datang",
                    subtitle = "Silakan masuk akun organisasi Anda untuk melanjutkan pemantauan."
                )

                GlassPanel(
                    intensity = GlassIntensity.Medium,
                ) {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(spacing.lg)
                    ) {
                        AuthTextField(
                            value = state.email,
                            onValueChange = { onEvent(AuthEvent.EmailChanged(it)) },
                            label = "Email Organisasi",
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Email,
                                imeAction = ImeAction.Next,
                            ),
                            enabled = !state.isLoading,
                            errorMessage = state.emailError.takeIf { state.emailTouched },
                            maxLength = 254,
                        )

                        AuthPasswordTextField(
                            value = state.password,
                            onValueChange = { onEvent(AuthEvent.PasswordChanged(it)) },
                            label = "Kata Sandi",
                            enabled = !state.isLoading,
                            errorMessage = state.passwordError.takeIf { state.passwordTouched },
                            imeAction = ImeAction.Done,
                        )

                        state.errorMessage?.let { msg ->
                            Text(
                                text = msg,
                                color = colors.accentDanger,
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
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
                enabled = state.canSubmitLogin,
                modifier = Modifier
                    .widthIn(max = 450.dp)
                    .padding(top = spacing.xl)
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
    val colors = SekreTheme.colors
    val spacing = SekreTheme.spacing

    SafeArea(applyImePadding = true) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = spacing.lg, vertical = spacing.xxl),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(
                modifier = Modifier.widthIn(max = 450.dp),
                verticalArrangement = Arrangement.spacedBy(spacing.xxl)
            ) {
                AuthHeader(
                    title = "Buat Akun",
                    subtitle = "Daftarkan organisasi Anda untuk memulai manajemen administrasi yang rapi."
                )

                GlassPanel(
                    intensity = GlassIntensity.Medium,
                ) {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(spacing.lg)
                    ) {
                        AuthTextField(
                            value = state.organizationName,
                            onValueChange = { onEvent(AuthEvent.OrganizationNameChanged(it)) },
                            label = "Nama Organisasi",
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Text,
                                capitalization = KeyboardCapitalization.Words,
                                imeAction = ImeAction.Next,
                            ),
                            enabled = !state.isLoading,
                            errorMessage = state.organizationNameError.takeIf { state.organizationNameTouched },
                            maxLength = AuthValidators.MAX_NAME_LENGTH,
                        )

                        AuthTextField(
                            value = state.subdomain,
                            onValueChange = { onEvent(AuthEvent.SubdomainChanged(it)) },
                            label = "Subdomain Organisasi",
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Ascii,
                                imeAction = ImeAction.Next,
                            ),
                            enabled = !state.isLoading,
                            errorMessage = state.subdomainError.takeIf { state.subdomainTouched },
                            maxLength = AuthValidators.MAX_SUBDOMAIN_LENGTH,
                            transformInput = ::sanitizeSubdomainInput,
                        )

                        AuthTextField(
                            value = state.fullName,
                            onValueChange = { onEvent(AuthEvent.FullNameChanged(it)) },
                            label = "Nama Lengkap",
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Text,
                                capitalization = KeyboardCapitalization.Words,
                                imeAction = ImeAction.Next,
                            ),
                            enabled = !state.isLoading,
                            errorMessage = state.fullNameError.takeIf { state.fullNameTouched },
                            maxLength = AuthValidators.MAX_NAME_LENGTH,
                        )

                        AuthTextField(
                            value = state.email,
                            onValueChange = { onEvent(AuthEvent.EmailChanged(it)) },
                            label = "Email",
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Email,
                                imeAction = ImeAction.Next,
                            ),
                            enabled = !state.isLoading,
                            errorMessage = state.emailError.takeIf { state.emailTouched },
                            maxLength = 254,
                        )

                        AuthPasswordTextField(
                            value = state.password,
                            onValueChange = { onEvent(AuthEvent.PasswordChanged(it)) },
                            label = "Kata Sandi",
                            enabled = !state.isLoading,
                            errorMessage = state.passwordError.takeIf { state.passwordTouched },
                            imeAction = ImeAction.Done,
                        )

                        state.errorMessage?.let { msg ->
                            Text(
                                text = msg,
                                color = colors.accentDanger,
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
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
                enabled = state.canSubmitRegister,
                modifier = Modifier
                    .widthIn(max = 450.dp)
                    .padding(top = spacing.xl)
            )
        }
    }
}
