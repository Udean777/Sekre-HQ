package org.sekre_mobile.com.presentation.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun LoginScreen(
    state: AuthState,
    onEvent: (AuthEvent) -> Unit,
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Text("Login")
        OutlinedTextField(
            modifier = Modifier.fillMaxWidth(),
            value = state.email,
            onValueChange = { onEvent(AuthEvent.EmailChanged(it)) },
            label = { Text("Email") },
        )
        OutlinedTextField(
            modifier = Modifier.fillMaxWidth(),
            value = state.password,
            onValueChange = { onEvent(AuthEvent.PasswordChanged(it)) },
            label = { Text("Password") },
        )
        state.errorMessage?.let {
            SelectionContainer {
                Text("DEBUG ERROR: $it")
            }
        }
        Button(
            onClick = { onEvent(AuthEvent.SubmitLogin) },
            enabled = !state.isLoading,
        ) {
            Text("Masuk")
        }
        Button(
            onClick = { onEvent(AuthEvent.OpenRegister) },
            enabled = !state.isLoading,
        ) {
            Text("Ke Register")
        }
        if (state.isLoading) CircularProgressIndicator()
    }
}

@Composable
fun RegisterScreen(
    state: AuthState,
    onEvent: (AuthEvent) -> Unit,
) {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Text("Register")
        OutlinedTextField(
            modifier = Modifier.fillMaxWidth(),
            value = state.organizationName,
            onValueChange = { onEvent(AuthEvent.OrganizationNameChanged(it)) },
            label = { Text("Organization") })
        OutlinedTextField(
            modifier = Modifier.fillMaxWidth(),
            value = state.subdomain,
            onValueChange = { onEvent(AuthEvent.SubdomainChanged(it)) },
            label = { Text("Subdomain") })
        OutlinedTextField(
            modifier = Modifier.fillMaxWidth(),
            value = state.fullName,
            onValueChange = { onEvent(AuthEvent.FullNameChanged(it)) },
            label = { Text("Full name") })
        OutlinedTextField(
            modifier = Modifier.fillMaxWidth(),
            value = state.email,
            onValueChange = { onEvent(AuthEvent.EmailChanged(it)) },
            label = { Text("Email") })
        OutlinedTextField(
            modifier = Modifier.fillMaxWidth(),
            value = state.password,
            onValueChange = { onEvent(AuthEvent.PasswordChanged(it)) },
            label = { Text("Password") })
        state.errorMessage?.let {
            SelectionContainer {
                Text("DEBUG ERROR: $it")
            }
        }
        Button(
            onClick = { onEvent(AuthEvent.SubmitRegister) },
            enabled = !state.isLoading
        ) { Text("Daftar") }
        Button(
            onClick = { onEvent(AuthEvent.OpenLogin) },
            enabled = !state.isLoading
        ) { Text("Ke Login") }
        if (state.isLoading) CircularProgressIndicator()
    }
}
